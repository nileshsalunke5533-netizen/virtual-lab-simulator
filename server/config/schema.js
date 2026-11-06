import pool from "./db.js";

async function hasColumn(tableName, columnName) {
  const [rows] = await pool.execute(
    `SELECT 1
       FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND column_name = ?
      LIMIT 1`,
    [tableName, columnName]
  );
  return rows.length > 0;
}

async function getUnsignedIdType(tableName) {
  const [rows] = await pool.execute(
    `SELECT column_type
       FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND column_name = 'id'
      LIMIT 1`,
    [tableName]
  );
  const columnType = rows[0]?.column_type;
  if (
    !columnType ||
    !/^(?:tinyint|smallint|mediumint|int|bigint)(?:\(\d+\))? unsigned$/i.test(
      columnType
    )
  ) {
    throw new Error(`The ${tableName}.id column must be an unsigned integer.`);
  }
  return columnType.replace(/\(\d+\)/, "");
}

export async function ensureSchema() {
  const userIdType = await getUnsignedIdType("users");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id ${userIdType} NOT NULL,
      token_hash CHAR(64) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used_at TIMESTAMP NULL DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_password_resets_token_hash (token_hash),
      KEY idx_password_resets_user_created (user_id, created_at),
      KEY idx_password_resets_expiry (expires_at),
      CONSTRAINT fk_password_resets_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      student_id BIGINT UNSIGNED NOT NULL,
      subject_id INT UNSIGNED NOT NULL,
      attendance_date DATE NOT NULL,
      status ENUM('Present', 'Absent') NOT NULL,
      marked_by BIGINT UNSIGNED NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_attendance_student_subject_date
        (student_id, subject_id, attendance_date),
      KEY idx_attendance_subject (subject_id),
      CONSTRAINT fk_attendance_student
        FOREIGN KEY (student_id) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
      CONSTRAINT fk_attendance_subject
        FOREIGN KEY (subject_id) REFERENCES subjects(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
      CONSTRAINT fk_attendance_marked_by
        FOREIGN KEY (marked_by) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE SET NULL
    ) ENGINE=InnoDB
  `);

  if (!(await hasColumn("attempts", "result_data"))) {
    await pool.query(
      "ALTER TABLE attempts ADD COLUMN result_data JSON NULL AFTER max_score"
    );
  }

  for (const [columnName, definition] of [
    ["marked_by", "BIGINT UNSIGNED NULL AFTER status"],
    ["created_at", "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP"],
    [
      "updated_at",
      "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
    ],
  ]) {
    if (!(await hasColumn("attendance", columnName))) {
      await pool.query(
        `ALTER TABLE attendance ADD COLUMN ${columnName} ${definition}`
      );
    }
  }

  const [indexes] = await pool.execute(
    `SELECT index_name, non_unique
       FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = 'attendance'
        AND index_name = 'uq_attendance_student_subject_date'
      LIMIT 1`
  );
  if (indexes.length === 0 || Number(indexes[0].non_unique) !== 0) {
    const [duplicates] = await pool.query(
      `SELECT 1
         FROM attendance
        GROUP BY student_id, subject_id, attendance_date
       HAVING COUNT(*) > 1
        LIMIT 1`
    );
    if (duplicates.length > 0) {
      throw new Error(
        "Attendance has duplicate student/subject/date records. Resolve duplicates before starting LabSim."
      );
    }
    await pool.query(
      `ALTER TABLE attendance
       ADD UNIQUE KEY uq_attendance_student_subject_date
         (student_id, subject_id, attendance_date)`
    );
  }
}
