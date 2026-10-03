import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
dotenv.config();

let driver = null;
let isNeo4jActive = false;
let connectionError = null;

export async function initializeNeo4j() {
  const uri = process.env.NEO4J_URI;
  const user = process.env.NEO4J_USER;
  const password = process.env.NEO4J_PASSWORD;

  if (!uri || !user || !password) {
    console.log('[Neo4j] No Neo4j Aura credentials found in environment. Defaulting to In-Memory Graph Engine fallback.');
    isNeo4jActive = false;
    return false;
  }

  try {
    driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
      connectionTimeout: 5000,
      maxConnectionLifetime: 3 * 60 * 60 * 1000,
    });
    const serverInfo = await driver.getServerInfo();
    console.log(`[Neo4j] Successfully connected to Neo4j Aura at ${serverInfo.address} (${serverInfo.agent})`);
    isNeo4jActive = true;
    connectionError = null;
    return true;
  } catch (err) {
    console.warn(`[Neo4j] Connection to Neo4j Aura failed (${err.message}). Using In-Memory Graph Engine fallback.`);
    isNeo4jActive = false;
    connectionError = err.message;
    return false;
  }
}

export function getNeo4jDriver() {
  return driver;
}

export function getNeo4jStatus() {
  return {
    active: isNeo4jActive,
    mode: isNeo4jActive ? 'Neo4j Aura Cloud' : 'In-Memory Graph Engine (Dual-Mode Fallback)',
    uri: process.env.NEO4J_URI ? process.env.NEO4J_URI.replace(/:[^:]*@/, ':***@') : null,
    error: connectionError
  };
}

export async function closeNeo4j() {
  if (driver) {
    await driver.close();
  }
}
