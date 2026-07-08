// =============================================================================
// ENGINSPECT - Backend API  (Node.js + Express + pg)
// File: server.js
// Run: node server.js
// =============================================================================

const express = require('express');
const { Pool }  = require('pg');
const cors      = require('cors');
const bcrypt    = require('bcrypt');
const jwt       = require('jsonwebtoken');

const app  = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'enginspect-secret-key';

// --- Database Connection ---
const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'enginspect',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '20mb' }));

// --- Auth Middleware ---
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// =============================================================================
// AUTH ROUTES
// =============================================================================

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role, avatar_url: user.avatar_url } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', auth, async (req, res) => {
  const { rows } = await pool.query('SELECT id, email, full_name, role, avatar_url FROM users WHERE id = $1', [req.user.id]);
  res.json(rows[0]);
});

// =============================================================================
// FACTORIES
// =============================================================================

// GET /api/factories
app.get('/api/factories', auth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM factories ORDER BY name');
  res.json(rows);
});

// POST /api/factories
app.post('/api/factories', auth, async (req, res) => {
  const { name, location, description } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO factories (name, location, description) VALUES ($1, $2, $3) RETURNING *',
    [name, location, description]
  );
  res.status(201).json(rows[0]);
});

// PUT /api/factories/:id
app.put('/api/factories/:id', auth, async (req, res) => {
  const { name, location, description } = req.body;
  const { rows } = await pool.query(
    'UPDATE factories SET name=$1, location=$2, description=$3 WHERE id=$4 RETURNING *',
    [name, location, description, req.params.id]
  );
  res.json(rows[0]);
});

// DELETE /api/factories/:id
app.delete('/api/factories/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM factories WHERE id=$1', [req.params.id]);
  res.json({ success: true });
});

// =============================================================================
// CATEGORIES
// =============================================================================

// GET /api/categories
app.get('/api/categories', auth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM categories ORDER BY name');
  res.json(rows);
});

// POST /api/categories
app.post('/api/categories', auth, async (req, res) => {
  const { id, name, description, icon } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO categories (id, name, description, icon) VALUES ($1, $2, $3, $4) RETURNING *',
    [id, name, description, icon]
  );
  res.status(201).json(rows[0]);
});

// =============================================================================
// EQUIPMENTS
// =============================================================================

// GET /api/equipments  (with optional factory_id / category_id filters)
app.get('/api/equipments', auth, async (req, res) => {
  const { factory_id, category_id, search } = req.query;
  let query = `
    SELECT e.*, f.name AS factory_name, c.name AS category_name
    FROM equipments e
    JOIN factories  f ON e.factory_id   = f.id
    JOIN categories c ON e.category_id  = c.id
    WHERE 1=1
  `;
  const params = [];
  if (factory_id)  { params.push(factory_id);  query += ` AND e.factory_id  = $${params.length}`; }
  if (category_id) { params.push(category_id); query += ` AND e.category_id = $${params.length}`; }
  if (search) {
    params.push(`%${search}%`);
    query += ` AND (e.tag_number ILIKE $${params.length} OR e.brand ILIKE $${params.length} OR f.name ILIKE $${params.length})`;
  }
  query += ' ORDER BY f.name, e.tag_number';
  const { rows } = await pool.query(query, params);
  res.json(rows);
});

// GET /api/equipments/:id
app.get('/api/equipments/:id', auth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT e.*, f.name AS factory_name, c.name AS category_name
     FROM equipments e JOIN factories f ON e.factory_id=f.id JOIN categories c ON e.category_id=c.id
     WHERE e.id = $1`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

// POST /api/equipments
app.post('/api/equipments', auth, async (req, res) => {
  const { factory_id, category_id, tag_number, department, brand, model, rated_spec, manufacturing_year, power_kw, capacity, efficiency, notes } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO equipments (factory_id, category_id, tag_number, department, brand, model, rated_spec, manufacturing_year, power_kw, capacity, efficiency, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [factory_id, category_id, tag_number, department, brand, model, rated_spec, manufacturing_year, power_kw, capacity, efficiency, notes]
  );
  res.status(201).json(rows[0]);
});

// PUT /api/equipments/:id
app.put('/api/equipments/:id', auth, async (req, res) => {
  const { factory_id, category_id, tag_number, department, brand, model, rated_spec, manufacturing_year, power_kw, capacity, efficiency, notes } = req.body;
  const { rows } = await pool.query(
    `UPDATE equipments SET factory_id=$1, category_id=$2, tag_number=$3, department=$4, brand=$5, model=$6, rated_spec=$7, manufacturing_year=$8, power_kw=$9, capacity=$10, efficiency=$11, notes=$12
     WHERE id=$13 RETURNING *`,
    [factory_id, category_id, tag_number, department, brand, model, rated_spec, manufacturing_year, power_kw, capacity, efficiency, notes, req.params.id]
  );
  res.json(rows[0]);
});

// DELETE /api/equipments/:id
app.delete('/api/equipments/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM equipments WHERE id=$1', [req.params.id]);
  res.json({ success: true });
});

// =============================================================================
// INSPECTIONS
// =============================================================================

// GET /api/inspections
app.get('/api/inspections', auth, async (req, res) => {
  const { equipment_id } = req.query;
  let query = `
    SELECT i.*, e.tag_number, e.factory_id, f.name AS factory_name, c.id AS category_id,
           u.full_name AS inspector_name
    FROM inspections i
    JOIN equipments  e ON i.equipment_id  = e.id
    JOIN factories   f ON e.factory_id    = f.id
    JOIN categories  c ON e.category_id   = c.id
    LEFT JOIN users  u ON i.inspector_id  = u.id
    WHERE 1=1
  `;
  const params = [];
  if (equipment_id) { params.push(equipment_id); query += ` AND i.equipment_id = $${params.length}`; }
  query += ' ORDER BY i.inspection_date DESC';
  const { rows } = await pool.query(query, params);
  res.json(rows);
});

// POST /api/inspections
app.post('/api/inspections', auth, async (req, res) => {
  const { equipment_id, inspection_date, summary } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO inspections (equipment_id, inspector_id, inspection_date, summary) VALUES ($1,$2,$3,$4) RETURNING *',
    [equipment_id, req.user.id, inspection_date, summary]
  );
  res.status(201).json(rows[0]);
});

// DELETE /api/inspections/:id
app.delete('/api/inspections/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM inspections WHERE id=$1', [req.params.id]);
  res.json({ success: true });
});

// =============================================================================
// MEASURES  (ECMs)
// =============================================================================

// GET /api/measures
app.get('/api/measures', auth, async (req, res) => {
  const { equipment_id, status } = req.query;
  let query = `
    SELECT m.*, e.tag_number, e.factory_id, f.name AS factory_name, c.id AS category_id
    FROM measures m
    JOIN equipments e ON m.equipment_id = e.id
    JOIN factories  f ON e.factory_id   = f.id
    JOIN categories c ON e.category_id  = c.id
    WHERE 1=1
  `;
  const params = [];
  if (equipment_id) { params.push(equipment_id); query += ` AND m.equipment_id = $${params.length}`; }
  if (status)       { params.push(status);        query += ` AND m.status       = $${params.length}`; }
  query += ' ORDER BY m.created_at DESC';
  const { rows } = await pool.query(query, params);
  res.json(rows);
});

// POST /api/measures
app.post('/api/measures', auth, async (req, res) => {
  const { equipment_id, name, energy_type, savings_pct, target_kw_tr, op_hours_yr, savings_kwh_yr, savings_baht_yr, investment_cost, payback_years, ghg_ton_yr, proposed_date } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO measures (equipment_id, created_by, name, energy_type, savings_pct, target_kw_tr, op_hours_yr, savings_kwh_yr, savings_baht_yr, investment_cost, payback_years, ghg_ton_yr, proposed_date)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
    [equipment_id, req.user.id, name, energy_type, savings_pct, target_kw_tr, op_hours_yr, savings_kwh_yr, savings_baht_yr, investment_cost, payback_years, ghg_ton_yr, proposed_date]
  );
  res.status(201).json(rows[0]);
});

// PUT /api/measures/:id/status
app.put('/api/measures/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  const { rows } = await pool.query('UPDATE measures SET status=$1 WHERE id=$2 RETURNING *', [status, req.params.id]);
  res.json(rows[0]);
});

// DELETE /api/measures/:id
app.delete('/api/measures/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM measures WHERE id=$1', [req.params.id]);
  res.json({ success: true });
});

// =============================================================================
// REPORTS  (M&V Reports)
// =============================================================================

// GET /api/reports
app.get('/api/reports', auth, async (req, res) => {
  const { equipment_id } = req.query;
  let query = 'SELECT r.*, e.tag_number FROM reports r LEFT JOIN equipments e ON r.equipment_id = e.id WHERE 1=1';
  const params = [];
  if (equipment_id) { params.push(equipment_id); query += ` AND r.equipment_id = $${params.length}`; }
  query += ' ORDER BY r.created_at DESC';
  const { rows } = await pool.query(query, params);
  res.json(rows);
});

// GET /api/reports/:id  (with custom params)
app.get('/api/reports/:id', auth, async (req, res) => {
  const [reportResult, paramsResult] = await Promise.all([
    pool.query('SELECT * FROM reports WHERE id = $1', [req.params.id]),
    pool.query('SELECT * FROM report_params WHERE report_id = $1 ORDER BY sort_order', [req.params.id])
  ]);
  if (!reportResult.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json({ ...reportResult.rows[0], custom_params: paramsResult.rows });
});

// POST /api/reports
app.post('/api/reports', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { custom_params = [], ...reportData } = req.body;
    const cols = Object.keys(reportData).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at');
    const vals = cols.map(k => reportData[k]);
    const placeholders = cols.map((_, i) => `$${i + 2}`).join(', ');
    const colStr = cols.join(', ');
    const { rows } = await client.query(
      `INSERT INTO reports (created_by, ${colStr}) VALUES ($1, ${placeholders}) RETURNING *`,
      [req.user.id, ...vals]
    );
    const reportId = rows[0].id;
    for (let i = 0; i < custom_params.length; i++) {
      const p = custom_params[i];
      await client.query(
        'INSERT INTO report_params (report_id, param_label, before_value, after_value, sort_order) VALUES ($1,$2,$3,$4,$5)',
        [reportId, p.label, p.beforeVal, p.afterVal, i]
      );
    }
    await client.query('COMMIT');
    res.status(201).json({ ...rows[0], custom_params });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// DELETE /api/reports/:id
app.delete('/api/reports/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM reports WHERE id=$1', [req.params.id]);
  res.json({ success: true });
});

// =============================================================================
// CHILLER CALCULATIONS
// =============================================================================

// POST /api/chiller-calc  (save a calculation result)
app.post('/api/chiller-calc', auth, async (req, res) => {
  const d = req.body;
  const { rows } = await pool.query(
    `INSERT INTO chiller_calculations
     (equipment_id, inspection_id, calculated_by, cooling_type, chws_temp_f, chwr_temp_f, chw_flow_gpm,
      power_input_kw, load_pct, op_hours_day, op_days_year, elec_rate, refrigerant,
      cws_temp_f, cwr_temp_f, cw_flow_gpm, dry_bulb_temp_f,
      cooling_tr, cooling_kw, cop, eer, kw_per_tr, heat_rej_kw, heat_balance_pct, carnot_eff_pct)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
     RETURNING *`,
    [
      d.equipment_id, d.inspection_id, req.user.id,
      d.cooling_type, d.chws_temp_f, d.chwr_temp_f, d.chw_flow_gpm,
      d.power_input_kw, d.load_pct, d.op_hours_day, d.op_days_year, d.elec_rate, d.refrigerant,
      d.cws_temp_f, d.cwr_temp_f, d.cw_flow_gpm, d.dry_bulb_temp_f,
      d.cooling_tr, d.cooling_kw, d.cop, d.eer, d.kw_per_tr, d.heat_rej_kw, d.heat_balance_pct, d.carnot_eff_pct
    ]
  );
  res.status(201).json(rows[0]);
});

// GET /api/chiller-calc/:equipment_id  (history)
app.get('/api/chiller-calc/:equipment_id', auth, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM chiller_calculations WHERE equipment_id=$1 ORDER BY calculated_at DESC LIMIT 20',
    [req.params.equipment_id]
  );
  res.json(rows);
});

// =============================================================================
// DASHBOARD SUMMARY
// =============================================================================

// GET /api/dashboard/summary
app.get('/api/dashboard/summary', auth, async (req, res) => {
  const [equipResult, inspResult, measResult] = await Promise.all([
    pool.query('SELECT COUNT(*) AS total FROM equipments'),
    pool.query('SELECT COUNT(*) AS total FROM inspections'),
    pool.query(`
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(CASE WHEN energy_type='elec' THEN savings_kwh_yr ELSE 0 END), 0) AS elec_kwh,
        COALESCE(SUM(CASE WHEN energy_type='heat' THEN savings_kwh_yr ELSE 0 END), 0) AS heat_kwh,
        COALESCE(SUM(savings_baht_yr), 0) AS baht_total,
        COALESCE(SUM(ghg_ton_yr), 0) AS ghg_total
      FROM measures`)
  ]);
  res.json({
    equipments:   parseInt(equipResult.rows[0].total),
    inspections:  parseInt(inspResult.rows[0].total),
    measures:     parseInt(measResult.rows[0].total),
    elec_kwh:     parseFloat(measResult.rows[0].elec_kwh),
    heat_kwh:     parseFloat(measResult.rows[0].heat_kwh),
    baht_total:   parseFloat(measResult.rows[0].baht_total),
    ghg_total:    parseFloat(measResult.rows[0].ghg_total)
  });
});

// =============================================================================
// SYSTEM SETTINGS
// =============================================================================

// GET /api/settings
app.get('/api/settings', auth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM system_settings');
  const result = {};
  rows.forEach(r => { result[r.key] = r.value; });
  res.json(result);
});

// PUT /api/settings/:key
app.put('/api/settings/:key', auth, async (req, res) => {
  const { value } = req.body;
  await pool.query(
    'INSERT INTO system_settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2',
    [req.params.key, JSON.stringify(value)]
  );
  res.json({ success: true });
});

// =============================================================================
// START SERVER
// =============================================================================
app.listen(PORT, () => {
  console.log(`ENGINSPECT API running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST /api/auth/login');
  console.log('  GET  /api/auth/me');
  console.log('  GET  /api/factories');
  console.log('  GET  /api/categories');
  console.log('  GET  /api/equipments');
  console.log('  GET  /api/inspections');
  console.log('  GET  /api/measures');
  console.log('  GET  /api/reports');
  console.log('  POST /api/chiller-calc');
  console.log('  GET  /api/dashboard/summary');
  console.log('  GET  /api/settings');
});
