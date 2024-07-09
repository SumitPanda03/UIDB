const express = require('express');
const router = express.Router();
const { createTable, getTables, getTableData, insertData, updateData, deleteData, aggregateFunctions, fullTextSearch, orderBy, queryBuilder, bulkInsertData, customQuery, sqlShell, estimateAffectedRows, createFullTextIndex, getChartData} = require('../controllers/tableController');
const { connectDatabase, getConnections } = require('../controllers/databaseController');

router.get('/connections', getConnections)
router.post('/connect-database', connectDatabase);
router.post('/create-table', createTable);
router.get('/get-tables', getTables);
router.get('/get-table-data/:tableName', getTableData);
router.post('/insert-data/:tableName', insertData)
router.put('/update-data/:tableName', updateData)
router.post('/delete-data/:tableName',deleteData)
router.post('/aggregate-functions', aggregateFunctions)
router.post('/full-text-search',fullTextSearch)
router.post('/orderby',orderBy)
router.post('/execute-query',queryBuilder)
router.post('/bulk-insert/:tableName', bulkInsertData);
router.post('/execute-custom-query', customQuery)
router.post('/execute-sql', sqlShell)
router.post('/estimate-affected-rows',estimateAffectedRows)
router.post('/create-fulltext-index',createFullTextIndex)
router.get('/chart-data/:tableName', getChartData);


module.exports = router;

