#!/usr/bin/env node
/**
 * Utilidad de un solo uso: genera el hash bcrypt de una contraseña para
 * pegarlo directamente en una migración SQL (`members.password_hash`) o para
 * cambiarle la contraseña a un socio ya existente vía SQL Editor de Supabase.
 *
 * Uso: node scripts/hash-password.mjs "la-contraseña"
 */
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error('Uso: node scripts/hash-password.mjs "la-contraseña"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
console.log(hash);
