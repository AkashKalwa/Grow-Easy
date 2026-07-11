import test from 'node:test';
import assert from 'node:assert';
import { parseCSV, csvToRecords } from './csv.js';

test('CSV Parser - Basic Parsing', () => {
  const csv = 'name,email,phone\nJohn Doe,john@example.com,9876543210';
  const rows = parseCSV(csv);
  
  assert.strictEqual(rows.length, 2);
  assert.deepStrictEqual(rows[0], ['name', 'email', 'phone']);
  assert.deepStrictEqual(rows[1], ['John Doe', 'john@example.com', '9876543210']);
});

test('CSV Parser - Quoted Comma Fields', () => {
  const csv = 'name,email,address\n"Doe, John",john@example.com,"Mumbai, India"';
  const rows = parseCSV(csv);
  
  assert.strictEqual(rows.length, 2);
  assert.deepStrictEqual(rows[0], ['name', 'email', 'address']);
  assert.deepStrictEqual(rows[1], ['Doe, John', 'john@example.com', 'Mumbai, India']);
});

test('CSV Parser - Escaped Double Quotes', () => {
  const csv = 'name,notes\nJohn Doe,"Said ""Hello World"""';
  const rows = parseCSV(csv);
  
  assert.strictEqual(rows.length, 2);
  assert.deepStrictEqual(rows[0], ['name', 'notes']);
  assert.deepStrictEqual(rows[1], ['John Doe', 'Said "Hello World"']);
});

test('CSV Parser - Empty Rows and Newlines', () => {
  const csv = 'name,email\n\nJohn Doe,john@example.com\n\n\n';
  const rows = parseCSV(csv);
  
  assert.strictEqual(rows.length, 2);
  assert.deepStrictEqual(rows[0], ['name', 'email']);
  assert.deepStrictEqual(rows[1], ['John Doe', 'john@example.com']);
});

test('CSV to Records Conversion', () => {
  const rows = [
    ['name', 'email'],
    ['John Doe', 'john@example.com'],
    ['Sarah Johnson', '']
  ];
  
  const records = csvToRecords(rows);
  assert.strictEqual(records.length, 2);
  assert.deepStrictEqual(records[0], { name: 'John Doe', email: 'john@example.com' });
  assert.deepStrictEqual(records[1], { name: 'Sarah Johnson', email: '' });
});
