-- Initial seed data for Idea Spark Application

-- Insert business themes
INSERT INTO business_themes (name, description, image_url) VALUES
('ヘルスケア・医療', 'Healthcare and medical technology innovations', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop'),
('フィンテック', 'Financial technology and payment solutions', 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=200&fit=crop'),
('教育・EdTech', 'Educational technology and learning platforms', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop'),
('環境・サステナビリティ', 'Environmental solutions and sustainable technology', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&h=200&fit=crop'),
('エンターテインメント・メディア', 'Entertainment, gaming, and media technology', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=200&fit=crop'),
('モビリティ・交通', 'Transportation and mobility solutions', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=200&fit=crop'),
('不動産・プロップテック', 'Real estate technology and property solutions', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300&h=200&fit=crop'),
('リテール・Eコマース', 'Retail technology and e-commerce platforms', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop'),
('アグリテック', 'Agricultural technology and food tech', 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=300&h=200&fit=crop'),
('ロジスティクス・物流', 'Logistics and supply chain technology', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&h=200&fit=crop');

-- Insert technologies
INSERT INTO technologies (name, category, maturity_level, description, use_cases, performance_metrics) VALUES
('人工知能・機械学習', 'AI/ML', '成熟', 'AI and machine learning technologies for automation and intelligence', 'Predictive analytics, automation, personalization', '{"accuracy": "90-95%", "processing_time": "< 100ms"}'),
('ブロックチェーン', 'Distributed Systems', '成長中', 'Distributed ledger technology for trust and transparency', 'Digital currency, smart contracts, supply chain', '{"tps": "1000-5000", "energy_efficiency": "low"}'),
('IoT・センサー技術', 'Hardware', '成熟', 'Internet of Things devices and sensor networks', 'Smart homes, industrial monitoring, healthcare', '{"connectivity": "99.9%", "battery_life": "5+ years"}'),
('5G・通信技術', 'Networking', '成長中', 'Next-generation wireless communication technology', 'Mobile broadband, IoT connectivity, edge computing', '{"speed": "1-10 Gbps", "latency": "< 1ms"}'),
('AR・VR', 'Extended Reality', '初期', 'Augmented and virtual reality technologies', 'Gaming, training, visualization, remote collaboration', '{"frame_rate": "90+ fps", "latency": "< 20ms"}'),
('クラウドコンピューティング', 'Infrastructure', '成熟', 'Scalable cloud infrastructure and services', 'Web applications, data storage, microservices', '{"uptime": "99.99%", "scalability": "unlimited"}'),
('エッジコンピューティング', 'Computing', '成長中', 'Distributed computing at the network edge', 'Real-time processing, IoT, autonomous systems', '{"latency": "< 10ms", "bandwidth_savings": "50%"}'),
('量子コンピューティング', 'Computing', '初期', 'Quantum computing for complex problem solving', 'Cryptography, optimization, drug discovery', '{"quantum_volume": "1000+", "coherence_time": "100ms"}'),
('バイオテクノロジー', 'Biotechnology', '成長中', 'Biological systems for technology applications', 'Gene therapy, personalized medicine, agriculture', '{"success_rate": "80%", "development_time": "5-10 years"}'),
('ロボティクス', 'Robotics', '成長中', 'Robotic systems for automation and assistance', 'Manufacturing, healthcare, service industry', '{"accuracy": "99%", "efficiency": "300% improvement"}');

-- Insert sample business ideas
INSERT INTO business_ideas (title, content, username) VALUES
('AIを活用した健康管理アプリ', 'ウェアラブルデバイスと連携し、個人の健康データをAIで分析して、パーソナライズされた健康アドバイスを提供するアプリケーション。予防医学の観点から、病気を未然に防ぐことを目的とする。', 'HealthTech太郎'),
('ブロックチェーン投票システム', '選挙や企業の意思決定において、ブロックチェーン技術を用いて透明性と改ざん不可能性を保証する電子投票システム。投票結果の信頼性を向上させる。', 'BlockChain花子'),
('VR教育プラットフォーム', '仮想現実技術を活用した没入型の教育体験を提供するプラットフォーム。歴史的な場所への仮想旅行や、危険な実験の安全なシミュレーションなどが可能。', 'EduVR次郎'),
('IoTスマートファーム', 'センサー技術とIoTを活用して、農作物の成長を最適化するスマート農業システム。土壌、気候、水分量を自動監視し、最適な栽培条件を維持する。', 'AgriTech三郎'),
('AI配送最適化サービス', '機械学習アルゴリズムを使用して、配送ルートを最適化し、配送コストと時間を削減するサービス。リアルタイムの交通情報と配送データを分析。', 'LogiAI四郎');

-- Link ideas with themes and technologies
DO $$
DECLARE
    health_idea_id UUID;
    blockchain_idea_id UUID;
    vr_idea_id UUID;
    iot_idea_id UUID;
    ai_idea_id UUID;
    
    healthcare_theme_id UUID;
    fintech_theme_id UUID;
    education_theme_id UUID;
    agri_theme_id UUID;
    logistics_theme_id UUID;
    
    ai_tech_id UUID;
    blockchain_tech_id UUID;
    ar_vr_tech_id UUID;
    iot_tech_id UUID;
    cloud_tech_id UUID;
BEGIN
    -- Get idea IDs
    SELECT id INTO health_idea_id FROM business_ideas WHERE title = 'AIを活用した健康管理アプリ';
    SELECT id INTO blockchain_idea_id FROM business_ideas WHERE title = 'ブロックチェーン投票システム';
    SELECT id INTO vr_idea_id FROM business_ideas WHERE title = 'VR教育プラットフォーム';
    SELECT id INTO iot_idea_id FROM business_ideas WHERE title = 'IoTスマートファーム';
    SELECT id INTO ai_idea_id FROM business_ideas WHERE title = 'AI配送最適化サービス';
    
    -- Get theme IDs
    SELECT id INTO healthcare_theme_id FROM business_themes WHERE name = 'ヘルスケア・医療';
    SELECT id INTO fintech_theme_id FROM business_themes WHERE name = 'フィンテック';
    SELECT id INTO education_theme_id FROM business_themes WHERE name = '教育・EdTech';
    SELECT id INTO agri_theme_id FROM business_themes WHERE name = 'アグリテック';
    SELECT id INTO logistics_theme_id FROM business_themes WHERE name = 'ロジスティクス・物流';
    
    -- Get technology IDs
    SELECT id INTO ai_tech_id FROM technologies WHERE name = '人工知能・機械学習';
    SELECT id INTO blockchain_tech_id FROM technologies WHERE name = 'ブロックチェーン';
    SELECT id INTO ar_vr_tech_id FROM technologies WHERE name = 'AR・VR';
    SELECT id INTO iot_tech_id FROM technologies WHERE name = 'IoT・センサー技術';
    SELECT id INTO cloud_tech_id FROM technologies WHERE name = 'クラウドコンピューティング';
    
    -- Link ideas with themes
    INSERT INTO idea_themes (idea_id, theme_id) VALUES
    (health_idea_id, healthcare_theme_id),
    (blockchain_idea_id, fintech_theme_id),
    (vr_idea_id, education_theme_id),
    (iot_idea_id, agri_theme_id),
    (ai_idea_id, logistics_theme_id);
    
    -- Link ideas with technologies
    INSERT INTO idea_technologies (idea_id, technology_id) VALUES
    (health_idea_id, ai_tech_id),
    (health_idea_id, iot_tech_id),
    (blockchain_idea_id, blockchain_tech_id),
    (vr_idea_id, ar_vr_tech_id),
    (vr_idea_id, cloud_tech_id),
    (iot_idea_id, iot_tech_id),
    (iot_idea_id, cloud_tech_id),
    (ai_idea_id, ai_tech_id),
    (ai_idea_id, cloud_tech_id);
END $$;

-- Update vote counts for some ideas
UPDATE business_ideas SET vote_count = 15 WHERE title = 'AIを活用した健康管理アプリ';
UPDATE business_ideas SET vote_count = 12 WHERE title = 'VR教育プラットフォーム';
UPDATE business_ideas SET vote_count = 8 WHERE title = 'IoTスマートファーム';
UPDATE business_ideas SET vote_count = 6 WHERE title = 'ブロックチェーン投票システム';
UPDATE business_ideas SET vote_count = 4 WHERE title = 'AI配送最適化サービス';

-- Insert admin settings
INSERT INTO admin_settings (key, value, description) VALUES
('site_title', 'Idea Spark', 'サイトのタイトル'),
('max_ideas_per_user', '10', 'ユーザーあたりの最大投稿アイデア数'),
('voting_enabled', 'true', '投票機能の有効/無効'),
('anonymous_posting', 'true', '匿名投稿の許可'),
('content_moderation', 'false', 'コンテンツモデレーションの有効/無効');