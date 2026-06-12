import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL || 'postgres://primer:primer123@localhost:5432/primerpromos');

export default sql;
