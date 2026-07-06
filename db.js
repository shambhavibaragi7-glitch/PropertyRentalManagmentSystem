const odbc = require('odbc');

const connectionString = process.env.DATABASE_URL || "Driver={ODBC Driver 17 for SQL Server};Server=(localdb)\\MSSQLLocalDB;Database=DbPropertyRental;Trusted_Connection=yes;";

async function query(sql, params = []) {
    const connection = await odbc.connect(connectionString);
    try {
        const result = await connection.query(sql, params);
        return result;
    } finally {
        await connection.close();
    }
}

async function fetchOne(sql, params = []) {
    const result = await query(sql, params);
    return result && result.length > 0 ? result[0] : null;
}

module.exports = {
    query,
    fetchOne
};
