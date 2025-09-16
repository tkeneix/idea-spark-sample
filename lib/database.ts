// Database utility functions for PostgreSQL operations
import { query } from './postgresql'

export interface BusinessIdea {
  id: string
  title: string
  content: string
  username: string
  vote_count: number
  created_at: string
  themes?: Array<{id: string, name: string}>
  technologies?: Array<{id: string, name: string}>
}

export interface BusinessTheme {
  id: string
  name: string
  description: string
  image_url?: string
  created_at: string
}

export interface Technology {
  id: string
  name: string
  category?: string
  maturity_level?: string
  description: string
  use_cases?: string
  performance_metrics?: any
  image_url?: string
  created_at: string
}

export interface Vote {
  id: string
  idea_id: string
  voter_ip: string
  created_at: string
}

export class Database {
  // Business Ideas operations
  static async getIdeas({
    page = 1,
    limit = 12,
    search = '',
    theme = '',
    sortBy = 'recent'
  }: {
    page?: number
    limit?: number
    search?: string
    theme?: string
    sortBy?: string
  } = {}) {
    const offset = (page - 1) * limit
    let whereClause = ''
    const params: any[] = [limit, offset]
    let paramIndex = 3

    // Build WHERE clause
    const conditions = []
    if (search) {
      conditions.push(`(bi.title ILIKE $${paramIndex} OR bi.content ILIKE $${paramIndex} OR bi.username ILIKE $${paramIndex})`)
      params.push(`%${search}%`)
      paramIndex++
    }
    if (theme) {
      conditions.push(`bt.name = $${paramIndex}`)
      params.push(theme)
      paramIndex++
    }
    if (conditions.length > 0) {
      whereClause = `WHERE ${conditions.join(' AND ')}`
    }

    // Build ORDER clause
    let orderClause = 'ORDER BY bi.created_at DESC'
    if (sortBy === 'popular') {
      orderClause = 'ORDER BY bi.vote_count DESC, bi.created_at DESC'
    } else if (sortBy === 'votes') {
      orderClause = 'ORDER BY bi.vote_count DESC'
    }

    const sql = `
      SELECT 
        bi.id,
        bi.title,
        bi.content,
        bi.username,
        bi.vote_count,
        bi.created_at,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', bt.id,
              'name', bt.name
            )
          ) FILTER (WHERE bt.id IS NOT NULL),
          '[]'::json
        ) as themes
      FROM business_ideas bi
      LEFT JOIN idea_themes it ON bi.id = it.idea_id
      LEFT JOIN business_themes bt ON it.theme_id = bt.id
      ${whereClause}
      GROUP BY bi.id, bi.title, bi.content, bi.username, bi.vote_count, bi.created_at
      ${orderClause}
      LIMIT $1 OFFSET $2
    `

    const countSql = `
      SELECT COUNT(DISTINCT bi.id) as total
      FROM business_ideas bi
      LEFT JOIN idea_themes it ON bi.id = it.idea_id
      LEFT JOIN business_themes bt ON it.theme_id = bt.id
      ${whereClause}
    `

    const [dataResult, countResult] = await Promise.all([
      query(sql, params),
      query(countSql, params.slice(2))
    ])

    return {
      ideas: dataResult.rows,
      total: parseInt(countResult.rows[0].total)
    }
  }

  static async getIdeaById(id: string) {
    const sql = `
      SELECT 
        bi.id,
        bi.title,
        bi.content,
        bi.username,
        bi.vote_count,
        bi.created_at,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', bt.id,
              'name', bt.name
            )
          ) FILTER (WHERE bt.id IS NOT NULL),
          '[]'::json
        ) as themes,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', t.id,
              'name', t.name
            )
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'::json
        ) as technologies
      FROM business_ideas bi
      LEFT JOIN idea_themes it ON bi.id = it.idea_id
      LEFT JOIN business_themes bt ON it.theme_id = bt.id
      LEFT JOIN idea_technologies ite ON bi.id = ite.idea_id
      LEFT JOIN technologies t ON ite.technology_id = t.id
      WHERE bi.id = $1
      GROUP BY bi.id, bi.title, bi.content, bi.username, bi.vote_count, bi.created_at
    `
    
    const result = await query(sql, [id])
    return result.rows[0] || null
  }

  static async createIdea(idea: Omit<BusinessIdea, 'id' | 'created_at' | 'vote_count'>, themeIds: string[] = [], technologyIds: string[] = []) {
    await query('BEGIN')
    
    try {
      // Insert idea
      const ideaSql = `
        INSERT INTO business_ideas (title, content, username)
        VALUES ($1, $2, $3)
        RETURNING id
      `
      const ideaResult = await query(ideaSql, [idea.title, idea.content, idea.username])
      const ideaId = ideaResult.rows[0].id

      // Insert theme relationships
      if (themeIds.length > 0) {
        const themeValues = themeIds.map((_, i) => `($1, $${i + 2})`).join(', ')
        const themeSql = `INSERT INTO idea_themes (idea_id, theme_id) VALUES ${themeValues}`
        await query(themeSql, [ideaId, ...themeIds])
      }

      // Insert technology relationships
      if (technologyIds.length > 0) {
        const techValues = technologyIds.map((_, i) => `($1, $${i + 2})`).join(', ')
        const techSql = `INSERT INTO idea_technologies (idea_id, technology_id) VALUES ${techValues}`
        await query(techSql, [ideaId, ...technologyIds])
      }

      await query('COMMIT')
      return await this.getIdeaById(ideaId)
    } catch (error) {
      await query('ROLLBACK')
      throw error
    }
  }

  // Business Themes operations
  static async getThemes() {
    const sql = 'SELECT * FROM business_themes ORDER BY created_at DESC'
    const result = await query(sql)
    return result.rows
  }

  static async createTheme(theme: Omit<BusinessTheme, 'id' | 'created_at'>) {
    const sql = `
      INSERT INTO business_themes (name, description, image_url)
      VALUES ($1, $2, $3)
      RETURNING *
    `
    const result = await query(sql, [theme.name, theme.description, theme.image_url || null])
    return result.rows[0]
  }

  static async updateTheme(id: string, theme: Omit<BusinessTheme, 'id' | 'created_at'>) {
    const sql = `
      UPDATE business_themes 
      SET name = $1, description = $2, image_url = $3
      WHERE id = $4
      RETURNING *
    `
    const result = await query(sql, [theme.name, theme.description, theme.image_url || null, id])
    return result.rows[0]
  }

  static async deleteTheme(id: string) {
    const sql = 'DELETE FROM business_themes WHERE id = $1'
    await query(sql, [id])
  }

  // Technologies operations
  static async getTechnologies() {
    const sql = 'SELECT * FROM technologies ORDER BY created_at DESC'
    const result = await query(sql)
    return result.rows
  }

  static async createTechnology(tech: Omit<Technology, 'id' | 'created_at'>) {
    const sql = `
      INSERT INTO technologies (name, category, maturity_level, description, use_cases, performance_metrics, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `
    const result = await query(sql, [
      tech.name,
      tech.category || null,
      tech.maturity_level || null,
      tech.description,
      tech.use_cases || null,
      tech.performance_metrics || null,
      tech.image_url || null
    ])
    return result.rows[0]
  }

  static async updateTechnology(id: string, tech: Omit<Technology, 'id' | 'created_at'>) {
    const sql = `
      UPDATE technologies 
      SET name = $1, category = $2, maturity_level = $3, description = $4, use_cases = $5, performance_metrics = $6, image_url = $7
      WHERE id = $8
      RETURNING *
    `
    const result = await query(sql, [
      tech.name,
      tech.category || null,
      tech.maturity_level || null,
      tech.description,
      tech.use_cases || null,
      tech.performance_metrics || null,
      tech.image_url || null,
      id
    ])
    return result.rows[0]
  }

  static async deleteTechnology(id: string) {
    const sql = 'DELETE FROM technologies WHERE id = $1'
    await query(sql, [id])
  }

  // Voting operations
  static async voteForIdea(ideaId: string, voterIp: string) {
    await query('BEGIN')
    
    try {
      // Insert vote
      const voteSql = 'INSERT INTO votes (idea_id, voter_ip) VALUES ($1, $2)'
      await query(voteSql, [ideaId, voterIp])

      // Update vote count
      const updateSql = `
        UPDATE business_ideas 
        SET vote_count = vote_count + 1 
        WHERE id = $1
        RETURNING vote_count
      `
      const updateResult = await query(updateSql, [ideaId])

      await query('COMMIT')
      return updateResult.rows[0].vote_count
    } catch (error) {
      await query('ROLLBACK')
      throw error
    }
  }

  // Admin settings operations
  static async getSettings() {
    const sql = 'SELECT * FROM admin_settings ORDER BY key'
    const result = await query(sql)
    return result.rows
  }

  static async getSetting(key: string) {
    const sql = 'SELECT * FROM admin_settings WHERE key = $1'
    const result = await query(sql, [key])
    return result.rows[0] || null
  }

  static async setSetting(key: string, value: string, description?: string) {
    const sql = `
      INSERT INTO admin_settings (key, value, description)
      VALUES ($1, $2, $3)
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        description = COALESCE(EXCLUDED.description, admin_settings.description),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `
    const result = await query(sql, [key, value, description || null])
    return result.rows[0]
  }

  // Leaderboard operations
  static async getLeaderboard({
    limit = 10,
    timeframe = 'all'
  }: {
    limit?: number
    timeframe?: string
  } = {}) {
    let whereClause = ''
    const params: any[] = [limit]

    // Add time filtering if specified
    if (timeframe === 'week') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      whereClause = 'WHERE bi.created_at >= $2'
      params.push(weekAgo.toISOString())
    } else if (timeframe === 'month') {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      whereClause = 'WHERE bi.created_at >= $2'
      params.push(monthAgo.toISOString())
    }

    const sql = `
      SELECT 
        bi.id,
        bi.title,
        bi.content,
        bi.username,
        bi.vote_count,
        bi.created_at,
        COALESCE(
          json_agg(
            DISTINCT bt.name
          ) FILTER (WHERE bt.name IS NOT NULL),
          '[]'::json
        ) as themes
      FROM business_ideas bi
      LEFT JOIN idea_themes it ON bi.id = it.idea_id
      LEFT JOIN business_themes bt ON it.theme_id = bt.id
      ${whereClause}
      GROUP BY bi.id, bi.title, bi.content, bi.username, bi.vote_count, bi.created_at
      ORDER BY bi.vote_count DESC, bi.created_at DESC
      LIMIT $1
    `

    const result = await query(sql, params)
    return result.rows
  }

  // Statistics
  static async getStats() {
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM business_ideas) as total_ideas,
        (SELECT COUNT(*) FROM business_themes) as total_themes,
        (SELECT COUNT(*) FROM technologies) as total_technologies,
        (SELECT COUNT(*) FROM votes) as total_votes,
        (SELECT COUNT(DISTINCT voter_ip) FROM votes) as unique_voters
    `
    const result = await query(sql)
    return result.rows[0]
  }

  // Get detailed statistics for admin dashboard
  static async getDetailedStats() {
    // Get total counts
    const totalsSql = `
      SELECT 
        (SELECT COUNT(*) FROM business_ideas) as total_ideas,
        (SELECT COUNT(*) FROM business_themes) as total_themes,
        (SELECT COUNT(*) FROM technologies) as total_technologies,
        (SELECT COUNT(*) FROM votes) as total_votes
    `
    const totalsResult = await query(totalsSql)
    const totals = totalsResult.rows[0]

    // Get recent activity (last 7 days)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    const recentSql = `
      SELECT 
        (SELECT COUNT(*) FROM business_ideas WHERE created_at >= $1) as recent_ideas,
        (SELECT COUNT(*) FROM votes WHERE created_at >= $1) as recent_votes
    `
    const recentResult = await query(recentSql, [weekAgo.toISOString()])
    const recent = recentResult.rows[0]

    // Get top themes by usage
    const themeUsageSql = `
      SELECT 
        bt.name,
        COUNT(it.theme_id) as count
      FROM business_themes bt
      LEFT JOIN idea_themes it ON bt.id = it.theme_id
      GROUP BY bt.id, bt.name
      HAVING COUNT(it.theme_id) > 0
      ORDER BY count DESC
      LIMIT 5
    `
    const themeUsageResult = await query(themeUsageSql)
    const topThemes = themeUsageResult.rows

    return {
      totalIdeas: parseInt(totals.total_ideas),
      totalThemes: parseInt(totals.total_themes),
      totalTechnologies: parseInt(totals.total_technologies),
      totalVotes: parseInt(totals.total_votes),
      recentIdeas: parseInt(recent.recent_ideas),
      recentVotes: parseInt(recent.recent_votes),
      topThemes
    }
  }

  // Get detailed idea by ID with full theme and technology information
  static async getDetailedIdeaById(id: string) {
    const sql = `
      SELECT 
        bi.id,
        bi.title,
        bi.content,
        bi.username,
        bi.vote_count,
        bi.created_at,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', bt.id,
              'name', bt.name,
              'description', bt.description
            )
          ) FILTER (WHERE bt.id IS NOT NULL),
          '[]'::json
        ) as themes,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', t.id,
              'name', t.name,
              'category', t.category,
              'maturity_level', t.maturity_level,
              'description', t.description
            )
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'::json
        ) as technologies
      FROM business_ideas bi
      LEFT JOIN idea_themes it ON bi.id = it.idea_id
      LEFT JOIN business_themes bt ON it.theme_id = bt.id
      LEFT JOIN idea_technologies ite ON bi.id = ite.idea_id
      LEFT JOIN technologies t ON ite.technology_id = t.id
      WHERE bi.id = $1
      GROUP BY bi.id, bi.title, bi.content, bi.username, bi.vote_count, bi.created_at
    `
    
    const result = await query(sql, [id])
    return result.rows[0] || null
  }

  // Get technologies by IDs (for generate-tech-idea route)
  static async getTechnologiesByIds(ids: string[]) {
    if (ids.length === 0) return []
    
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ')
    const sql = `SELECT * FROM technologies WHERE id IN (${placeholders})`
    const result = await query(sql, ids)
    return result.rows
  }

  // Get admin settings with filtering
  static async getSettingsByKeys(keys: string[]) {
    if (keys.length === 0) return []
    
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ')
    const sql = `SELECT key, value FROM admin_settings WHERE key IN (${placeholders})`
    const result = await query(sql, keys)
    return result.rows
  }
}