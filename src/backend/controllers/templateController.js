const pool = require('../config/db');

// GET all product templates with their parts
exports.getTemplates = async (req, res) => {
  try {
    const [templates] = await pool.query('SELECT * FROM product_templates ORDER BY name ASC');
    for (const t of templates) {
      const [parts] = await pool.query(
        'SELECT * FROM template_parts WHERE template_id = ? ORDER BY id ASC',
        [t.id]
      );
      t.parts = parts;
    }
    res.json({ success: true, data: templates });
  } catch (err) {
    console.error('getTemplates error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET single template by id (or by name for auto-match)
exports.getTemplateByName = async (req, res) => {
  const { name } = req.params;
  try {
    // Case-insensitive fuzzy match on product name
    const [templates] = await pool.query(
      'SELECT * FROM product_templates WHERE LOWER(name) = LOWER(?)',
      [name]
    );
    if (templates.length === 0) {
      return res.json({ success: false, data: null });
    }
    const t = templates[0];
    const [parts] = await pool.query(
      'SELECT * FROM template_parts WHERE template_id = ? ORDER BY id ASC',
      [t.id]
    );
    t.parts = parts;
    res.json({ success: true, data: t });
  } catch (err) {
    console.error('getTemplateByName error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST create a new template with parts
exports.createTemplate = async (req, res) => {
  const { name, description, parts } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Template name is required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO product_templates (name, description) VALUES (?, ?)',
      [name, description || '']
    );
    const templateId = result.insertId;

    // Insert parts if provided
    if (Array.isArray(parts) && parts.length > 0) {
      for (const p of parts) {
        if (p.part_name) {
          await pool.query(
            'INSERT INTO template_parts (template_id, part_name, qty_per_unit, unit) VALUES (?,?,?,?)',
            [templateId, p.part_name, p.qty_per_unit || 1, p.unit || 'pcs']
          );
        }
      }
    }

    // Fetch full created template
    const [rows] = await pool.query('SELECT * FROM product_templates WHERE id = ?', [templateId]);
    const template = rows[0];
    const [templateParts] = await pool.query('SELECT * FROM template_parts WHERE template_id = ?', [templateId]);
    template.parts = templateParts;

    res.status(201).json({ success: true, message: 'Template created', data: template });
  } catch (err) {
    console.error('createTemplate error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT update template name/description
exports.updateTemplate = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    await pool.query(
      'UPDATE product_templates SET name=?, description=? WHERE id=?',
      [name, description || '', id]
    );
    res.json({ success: true, message: 'Template updated' });
  } catch (err) {
    console.error('updateTemplate error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE template (cascade deletes parts via FK)
exports.deleteTemplate = async (req, res) => {
  try {
    await pool.query('DELETE FROM product_templates WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Template deleted' });
  } catch (err) {
    console.error('deleteTemplate error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST add a part to existing template
exports.addPart = async (req, res) => {
  const { id } = req.params;
  const { part_name, qty_per_unit, unit } = req.body;
  if (!part_name) return res.status(400).json({ success: false, message: 'Part name required' });
  try {
    const [result] = await pool.query(
      'INSERT INTO template_parts (template_id, part_name, qty_per_unit, unit) VALUES (?,?,?,?)',
      [id, part_name, qty_per_unit || 1, unit || 'pcs']
    );
    res.status(201).json({ success: true, message: 'Part added', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE a part from a template
exports.deletePart = async (req, res) => {
  try {
    await pool.query('DELETE FROM template_parts WHERE id=? AND template_id=?', [req.params.pid, req.params.id]);
    res.json({ success: true, message: 'Part removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
