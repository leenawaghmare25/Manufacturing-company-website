const pool = require('../config/db');

/**
 * AUTOMATION UTILITY
 * Handles the logic for automatically creating jobs and task assignments
 * when a new order is received.
 */

/**
 * Triggered after a new order is saved to the database.
 * Creates a Job in 'Pending Approval' status and auto-assigns tasks to workers.
 */
async function handleOrderCreated(orderData) {
  const { id: orderId, item_name, quantity, deadline, priority } = orderData;
  const newJobId = `JOB-${Date.now()}`;

  try {
    console.log(`[Automation] Processing automation for Order ID: ${orderId} (${item_name})`);

    // 1. Find the product template for this item
    const [templates] = await pool.query(
      'SELECT * FROM product_templates WHERE LOWER(name) = LOWER(?)',
      [item_name]
    );

    if (templates.length === 0) {
      console.warn(`[Automation] No template found for product: ${item_name}. Skipping auto-job creation.`);
      return;
    }

    const template = templates[0];

    // 2. Fetch template parts
    const [templateParts] = await pool.query(
      'SELECT * FROM template_parts WHERE template_id = ? ORDER BY id ASC',
      [template.id]
    );

    // 3. Create the Job in 'Pending Approval' status
    await pool.query(
      'INSERT INTO jobs (id, product, quantity, team, status, priority, progress, deadline, orderId, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        newJobId, 
        item_name, 
        quantity, 
        'Auto-Assigned', 
        'Pending Approval', 
        priority || 'Medium', 
        0, 
        deadline || null, 
        orderId,
        `Auto-generated from Order #${orderId}`
      ]
    );

    // 4. Create Job Parts
    for (const part of templateParts) {
      await pool.query(
        'INSERT INTO job_parts (jobId, name, requiredQty) VALUES (?, ?, ?)',
        [newJobId, part.part_name, part.qty_per_unit * quantity]
      );
    }

    // 5. AUTO-ASSIGNMENT: Fetch all Production Staff
    const [workers] = await pool.query(
      "SELECT name FROM users WHERE role = 'Production Staff' ORDER BY id ASC"
    );

    if (workers.length > 0) {
      console.log(`[Automation] Assigning ${templateParts.length} tasks to ${workers.length} workers.`);
      
      // Distribute tasks among workers (Round Robin)
      for (let i = 0; i < templateParts.length; i++) {
        const part = templateParts[i];
        const assignedWorker = workers[i % workers.length].name;
        const taskId = `T-${Date.now()}-${i}`;

        await pool.query(
          'INSERT INTO tasks (taskId, jobId, jobName, partName, worker, status, deadline) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            taskId,
            newJobId,
            item_name,
            part.part_name,
            assignedWorker,
            'Pending',
            deadline || null
          ]
        );
      }
    } else {
      console.warn(`[Automation] No Production Staff found. Tasks created without assignment.`);
      // Still create tasks but move them to "Unassigned" or similar? 
      // For now, assign to null/empty string as per schema
      for (let i = 0; i < templateParts.length; i++) {
        const part = templateParts[i];
        const taskId = `T-${Date.now()}-${i}`;

        await pool.query(
          'INSERT INTO tasks (taskId, jobId, jobName, partName, worker, status, deadline) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [taskId, newJobId, item_name, part.part_name, '', 'Pending', deadline || null]
        );
      }
    }

    // 6. Update Order Status to 'processing' (as it's now tied to a job)
    await pool.query('UPDATE orders SET status = "processing" WHERE id = ?', [orderId]);
    await pool.query('INSERT INTO order_history (order_id, status, remarks) VALUES (?, ?, ?)', 
      [orderId, 'processing', `Automated job created: ${newJobId}`]);

    console.log(`[Automation] Successfully created Job ${newJobId} for Order ${orderId}`);

  } catch (error) {
    console.error(`[Automation] Error processing order ${orderId}:`, error);
  }
}

module.exports = {
  handleOrderCreated
};
