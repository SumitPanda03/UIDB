const { createMySQLConnection } = require('../services/mysqlService');
const User = require('../models/User')

const getConnectionDetails = async (userId) => {
  const user = await User.findById(userId);
  return user.sqlConnectionDetails;
};

const createTable = async (req, res) => {
  const { tableName, columns } = req.body;
  // console.log(tableName,columns);
  const { host,user,password,database } = req.headers;
  // console.log(req.headers);
  // const connectionDetails = { host,user,password,database}
  const connectionDetails = await getConnectionDetails(req.user.id);
  try {
    const connection = await createMySQLConnection(connectionDetails);

    const columnDefinitions = Object.entries(columns)
      .map(([name, type]) => `${name} ${type}`)
      .join(', ');
      // console.log(columnDefinitions);

    const createTableQuery = `CREATE TABLE ${tableName} (${columnDefinitions})`;

    await connection.execute(createTableQuery);
    await connection.end();

    res.status(200).json({ 
      message: 'Table created successfully',
      sqlCommand: createTableQuery
    });
  } catch (error) {
    console.error('Error creating table:', error);
    res.status(500).json({ error: 'Error creating table' });
  }
};

const getTables = async (req, res) => {
    const { host,user,password,database } = req.headers;
    // console.log(req.headers);
    // const connectionDetails = { host,user,password,database}
    const connectionDetails = await getConnectionDetails(req.user.id);
    // console.log(connectionDetails);

    try {
      const connection = await createMySQLConnection(connectionDetails);
      const [rows] = await connection.execute('SHOW TABLES');
      await connection.end();
      // console.log(rows)
      const tables = rows.map(row => Object.values(row)[0]);
      res.status(200).json({ tables });
    } catch (error) {
      console.error('Error fetching tables:', error);
      res.status(500).json({ error: 'Error fetching tables' });
    }
  };
  
  const getTableData = async (req, res) => {
    const { tableName } = req.params;
    const { page = 1, itemsPerPage = 50 } = req.query;
    const offset = (page - 1) * itemsPerPage;
    // console.log(tableName);
    // const { host,user,password,database } = req.headers;
    // console.log(req.headers);
    // const connectionDetails = { host,user,password,database}
    const connectionDetails = await getConnectionDetails(req.user.id);

    try {
      const connection = await createMySQLConnection(connectionDetails);
      
      // Get table structure
      const [structureRows] = await connection.execute(`DESCRIBE ${tableName}`);
      // console.log(structureRows);
      const structure = structureRows.map(row => ({
        Field: row.Field,
        Type: row.Type,
        Null: row.Null,
        Key: row.Key,
        Default: row.Default,
        Extra: row.Extra
      }));
  
      // Get table data
      const [dataRows] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 100`);
      const [countResult] = await connection.execute(`SELECT COUNT(*) as total FROM ${tableName}`);
      const totalItems = countResult[0].total;

      await connection.end();
  
    res.status(200).json({ structure, data: dataRows, totalItems });
    } catch (error) {
      console.error('Error fetching table data:', error);
      res.status(500).json({ error: 'Error fetching table data' });
    }
  };
  
  const insertData = async (req, res) => {
    const { data } = req.body;
    // console.log(data);
    const { tableName } = req.params;
    const connectionDetails = await getConnectionDetails(req.user.id);

    try {
      const connection = await createMySQLConnection(connectionDetails);
      const columns = Object.keys(data).join(', ');
      const values = Object.values(data).map(value => connection.escape(value)).join(', ');
      const query = `INSERT INTO ${tableName} (${columns}) VALUES (${values})`;
      // console.log("Backend",query);
      await connection.execute(query);
      res.status(201).json({ message: 'Data inserted successfully' , query});
      await connection.end();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
// In your backend API file (e.g., api.js or routes.js)

const bulkInsertData = async (req, res) => {
  const { tableName } = req.params;
  const { data } = req.body;
  const connectionDetails = await getConnectionDetails(req.user.id);

  try {
    const connection = await createMySQLConnection(connectionDetails);

    // Start a transaction
    await connection.beginTransaction();

    try {
      for (const row of data) {
        const columns = Object.keys(row).join(', ');
        const values = Object.values(row).map(value => connection.escape(value)).join(', ');
        const query = `INSERT INTO ${tableName} (${columns}) VALUES (${values})`;
        await connection.execute(query);
      }

      // Commit the transaction
      await connection.commit();

      res.status(201).json({ message: `${data.length} rows inserted successfully` });
    } catch (error) {
      // If there's an error, rollback the transaction
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error in bulk insertion:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add this route to your Express app
  const updateData = async (req, res) => {
    const { tableName } = req.params;
    const { data, condition } = req.body;
    const connectionDetails = await getConnectionDetails(req.user.id);
  
    try {
      const connection = await createMySQLConnection(connectionDetails);
  
      // Prepare SET clause
      const setClause = Object.entries(data)
        .map(([key, value]) => `${key} = ${connection.escape(value)}`)
        .join(', ');
  
      // Prepare WHERE clause
      const whereClause = Object.entries(condition)
        .map(([key, value]) => `${key} = ${connection.escape(value)}`)
        .join(' AND ');
  
      const query = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause}`;
  
      const [result] = await connection.execute(query);
      // console.log(result);
      await connection.end();
  
      if (result.affectedRows > 0) {
        res.status(200).json({ 
          message: 'Data updated successfully', 
          affectedRows: result.affectedRows,
          query 
        });
      } else {
        res.status(404).json({ message: 'No matching records found to update' });
      }
    } catch (error) {
      console.error('Error updating data:', error);
      res.status(500).json({ error: 'Error updating data', details: error.message });
    }
  };

  // Backend route for executing custom query
const customQuery =  async (req, res) => {
  const { query } = req.body;
  const connectionDetails = await getConnectionDetails(req.user.id);

  try {
    const connection = await createMySQLConnection(connectionDetails);
    const [result] = await connection.execute(query);
    await connection.end();

    res.status(200).json({ 
      message: 'Query executed successfully', 
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error('Error executing custom query:', error);
    res.status(500).json({ error: 'Error executing custom query', details: error.message });
  }
}


  const deleteData = async (req, res) => {
    const { tableName } = req.params;
    const { data } = req.body;
    const condition = data.condition
    // console.log(condition);
    const connectionDetails = await getConnectionDetails(req.user.id);
  
    try {
      const connection = await createMySQLConnection(connectionDetails);
  
      // Prepare WHERE clause
      const whereClause = Object.entries(condition)
        .map(([key, value]) => `${key} = ${connection.escape(value)}`)
        .join(' AND ');
  
      const query = `DELETE FROM ${tableName} WHERE ${whereClause}`;
  
      const [result] = await connection.execute(query);
  
      await connection.end();
  
      if (result.affectedRows > 0) {
        res.status(200).json({ 
          message: 'Data deleted successfully', 
          affectedRows: result.affectedRows,
          query 
        });
      } else {
        res.status(404).json({ message: 'No matching records found to delete' });
      }
    } catch (error) {
      console.error('Error deleting data:', error);
      res.status(500).json({ error: 'Error deleting data', details: error.message });
    }
  };

  const estimateAffectedRows = async (req, res) => {
    const { query } = req.body;
    const connectionDetails = await getConnectionDetails(req.user.id);
  
    try {
      const connection = await createMySQLConnection(connectionDetails);
  
      // Convert DELETE to SELECT COUNT(*)
      const countQuery = query.replace(/^DELETE/, 'SELECT COUNT(*)');
      const [result] = await connection.execute(countQuery);
  
      await connection.end();
  
      res.status(200).json({ 
        estimatedRows: result[0]['COUNT(*)']
      });
    } catch (error) {
      console.error('Error estimating affected rows:', error);
      res.status(500).json({ error: 'Error estimating affected rows', details: error.message });
    }
  };

  const aggregateFunctions = async (req, res) => {
    const { operation, tableName, column, condition } = req.body;
    const connectionDetails = await getConnectionDetails(req.user.id);
  
    try {
      const connection = await createMySQLConnection(connectionDetails);
  
      let query = '';
      let params = [];
  
      switch (operation.toUpperCase()) {
        case 'COUNT':
          query = `SELECT COUNT(${column}) as result FROM ${tableName}`;
          break;
        case 'SUM':
          query = `SELECT SUM(${column}) as result FROM ${tableName}`;
          break;
        case 'AVG':
          query = `SELECT AVG(${column}) as result FROM ${tableName}`;
          break;
        case 'MAX':
          query = `SELECT MAX(${column}) as result FROM ${tableName}`;
          break;
        case 'MIN':
          query = `SELECT MIN(${column}) as result FROM ${tableName}`;
          break;
        default:
          return res.status(400).json({ error: 'Invalid operation. Supported operations are COUNT, SUM, AVG, MAX, MIN.' });
      }
  
      // Add WHERE clause if condition is provided
      if (condition) {
        const whereClause = Object.entries(condition)
          .map(([key, value]) => {
            params.push(value);
            return `${key} = ?`;
          })
          .join(' AND ');
        query += ` WHERE ${whereClause}`;
      }
  
      const [result] = await connection.execute(query, params);
  
      await connection.end();
  
      if (result.length > 0) {
        res.status(200).json({ 
          operation: operation,
          result: result[0].result,
          query: query
        });
      } else {
        res.status(404).json({ message: 'No results found' });
      }
    } catch (error) {
      console.error('Error performing aggregate operation:', error);
      res.status(500).json({ error: 'Error performing aggregate operation', details: error.message });
    }
  };

  // Backend endpoint for creating FULLTEXT index
  const createFullTextIndex = async (req, res) => {
    const { tableName, columns } = req.body;
    const connectionDetails = await getConnectionDetails(req.user.id);

    try {
      const connection = await createMySQLConnection(connectionDetails);

      const columnList = columns.join(', ');
      const query = `ALTER TABLE ${tableName} ADD FULLTEXT(${columnList})`;

      await connection.execute(query);

      await connection.end();

      res.status(200).json({ message: 'FULLTEXT index created successfully' });
    } catch (error) {
      console.error('Error creating FULLTEXT index:', error);
      res.status(500).json({ error: 'Error creating FULLTEXT index', details: error.message });
    }
  };

  const fullTextSearch = async (req, res) => {
    const { tableName, searchColumns, searchTerm, mode } = req.body;
    const connectionDetails = await getConnectionDetails(req.user.id);
  
    try {
      const connection = await createMySQLConnection(connectionDetails);
  
      // Validate input
      if (!tableName || !searchColumns || !searchTerm) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }
  
      // Prepare columns for search
      const columns = Array.isArray(searchColumns) ? searchColumns.join(', ') : searchColumns;
  
      // Determine search mode
      let searchMode = '';
      switch (mode?.toUpperCase()) {
        case 'NATURAL':
          searchMode = 'IN NATURAL LANGUAGE MODE';
          break;
        case 'BOOLEAN':
          searchMode = 'IN BOOLEAN MODE';
          break;
        case 'QUERY_EXPANSION':
          searchMode = 'WITH QUERY EXPANSION';
          break;
        default:
          searchMode = ''; // Default mode
      }
  
      // Construct the query
      const query = `SELECT * FROM ${tableName} WHERE MATCH(${columns}) AGAINST(? ${searchMode})`;
  
      const [results] = await connection.execute(query, [searchTerm]);
  
      await connection.end();
  
      if (results.length > 0) {
        res.status(200).json({ 
          results: results,
          count: results.length,
          query: query
        });
      } else {
        res.status(404).json({ message: 'No results found' });
      }
    } catch (error) {
      console.error('Error performing full-text search:', error);
      res.status(500).json({ error: 'Error performing full-text search', details: error.message });
    }
  };

  const orderBy = async (req, res) => {
    const { tableName, orderBy, limit, offset } = req.body;
    const connectionDetails = await getConnectionDetails(req.user.id);
  
    try {
      const connection = await createMySQLConnection(connectionDetails);
  
      // Validate input
      if (!tableName || !orderBy || !Array.isArray(orderBy)) {
        return res.status(400).json({ error: 'Invalid or missing parameters' });
      }
  
      // Construct the ORDER BY clause
      const orderByClause = orderBy.map(item => {
        const column = connection.escapeId(item.column); // Escape column name to prevent SQL injection
        const direction = item.direction && item.direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        return `${column} ${direction}`;
      }).join(', ');
  
      // Construct the query
      let query = `SELECT * FROM ${connection.escapeId(tableName)} ORDER BY ${orderByClause}`;
  
      // Add LIMIT and OFFSET if provided
      const params = [];
      if (limit !== undefined) {
        query += ' LIMIT ?';
        params.push(Number(limit));
  
        if (offset !== undefined) {
          query += ' OFFSET ?';
          params.push(Number(offset));
        }
      }
  
      const [results] = await connection.execute(query, params);
  
      await connection.end();
  
      if (results.length > 0) {
        res.status(200).json({ 
          results: results,
          count: results.length,
          query: query
        });
      } else {
        res.status(404).json({ message: 'No results found' });
      }
    } catch (error) {
      console.error('Error performing ordered query:', error);
      res.status(500).json({ error: 'Error performing ordered query', details: error.message });
    }
  };

  const queryBuilder = async(req,res) => {
    const { query, params } = req.body;
    const connectionDetails = await getConnectionDetails(req.user.id);
  
    try {
      const connection = await createMySQLConnection(connectionDetails);
      const [rows, fields] = await connection.execute(query, params);
      await connection.end();
  
      res.status(200).json({ results: rows, fields });
    } catch (error) {
      console.error('Error executing custom query:', error);
      res.status(500).json({ error: 'Error executing custom query', details: error.message });
    }
  }

   const sqlShell = async (req, res) => {
    const { query } = req.body;
    const connectionDetails = await getConnectionDetails(req.user.id);
  
    try {
      const connection = await createMySQLConnection(connectionDetails);
  
      // Determine the type of SQL command
      const commandType = query.trim().split(' ')[0].toUpperCase();
  
      let result;
      // if (['SELECT', 'SHOW', 'DESCRIBE', 'EXPLAIN'].includes(commandType)) {
      //   [result] = await connection.query(query);
      // } else {
      //   [result] = await connection.execute(query);
      // }
      [result] = await connection.query(query);
  
      await connection.end();
      res.status(200).json({ 
        message: `Query executed successfully. Affected rows: ${result.affectedRows}`, 
        result: result
      });
    } catch (error) {
      console.error('Error executing SQL command:', error);
      res.status(500).json({ error: 'Error executing SQL command', message: error.message });
    }
  };

  const getChartData = async (req, res) => {
    const { tableName } = req.params;
    const connectionDetails = await getConnectionDetails(req.user.id);
  
    try {
      const connection = await createMySQLConnection(connectionDetails);
      
      // This is a simple example. You'd need to adjust this query based on your data structure
      const [rows] = await connection.execute(`
        SELECT DATE(created_at) as date, COUNT(*) as count 
        FROM ${tableName} 
        GROUP BY DATE(created_at) 
        ORDER BY DATE(created_at)
      `);
  
      await connection.end();
  
      const labels = rows.map(row => row.date);
      const data = rows.map(row => row.count);
  
      res.json({
        labels,
        datasets: [{
          label: `${tableName} Records`,
          data,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
      res.status(500).json({ error: 'Error fetching chart data' });
    }
  };
  
  // Add this route to your Express app
  module.exports = {
    createTable,
    getTables,
    getTableData,
    insertData,
    updateData,
    deleteData,
    aggregateFunctions,
    fullTextSearch,
    orderBy,
    queryBuilder,
    bulkInsertData,
    customQuery,
    sqlShell,
    estimateAffectedRows,
    createFullTextIndex,
    getChartData
  };