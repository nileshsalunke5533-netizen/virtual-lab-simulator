CREATE DATABASE IF NOT EXISTS labsim
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE labsim;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  roll_no VARCHAR(40) NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(30) NULL,
  branch VARCHAR(100) NULL,
  semester TINYINT UNSIGNED NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'faculty') NOT NULL DEFAULT 'student',
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_roll_no (roll_no),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role_status_semester (role, status, semester)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS subjects (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(10) NOT NULL,
  name VARCHAR(150) NOT NULL,
  semester TINYINT UNSIGNED NOT NULL,
  assessment_type ENUM('quiz', 'completion') NOT NULL,
  max_score SMALLINT UNSIGNED NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_subjects_code (code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS experiments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  subject_id INT UNSIGNED NOT NULL,
  experiment_no SMALLINT UNSIGNED NOT NULL,
  title VARCHAR(500) NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_experiments_subject_number (subject_id, experiment_no),
  KEY idx_experiments_subject_enabled (subject_id, enabled),
  CONSTRAINT fk_experiments_subject
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS attempts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  student_id BIGINT UNSIGNED NOT NULL,
  experiment_id INT UNSIGNED NOT NULL,
  attempt_number SMALLINT UNSIGNED NOT NULL,
  status ENUM('in_progress', 'completed') NOT NULL DEFAULT 'in_progress',
  score DECIMAL(7,2) NULL,
  max_score DECIMAL(7,2) NULL,
  result_data JSON NULL,
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_attempt_student_experiment_number
    (student_id, experiment_id, attempt_number),
  KEY idx_attempts_student_status (student_id, status),
  KEY idx_attempts_experiment_status (experiment_id, status),
  CONSTRAINT fk_attempts_student
    FOREIGN KEY (student_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_attempts_experiment
    FOREIGN KEY (experiment_id) REFERENCES experiments(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS password_resets (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
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
) ENGINE=InnoDB;

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
) ENGINE=InnoDB;

INSERT IGNORE INTO subjects (id, code, name, semester, assessment_type, max_score)
VALUES
  (1, 'DST', 'Data Structure Using C', 3, 'quiz', 20),
  (2, 'DTM', 'Digital Techniques', 3, 'completion', NULL),
  (3, 'DCN', 'Data Communication and Networking', 3, 'completion', NULL),
  (4, 'IFS', 'Information Security', 4, 'quiz', 20);

INSERT IGNORE INTO experiments (id, subject_id, experiment_no, title, enabled)
VALUES
  (1, 1, 1, 'Write a ''C'' program to perform various operations on one dimensional array. E.g. Creation, Insertion, Deletion and Display.', 1),
  (2, 1, 2, 'Write a ''C'' program for different sorting techniques: Bubble Sort, Insertion Sort, Selection Sort and Merge Sort.', 1),
  (3, 1, 3, 'Write a program for implementing various searching techniques: Linear Search and Binary Search.', 1),
  (4, 1, 4, 'Write a ''C'' program to perform PUSH and POP operations of stack using array.', 1),
  (5, 1, 5, 'Write a ''C'' program for finding factorial and Fibonacci series by using recursion.', 1),
  (6, 1, 6, 'Write a C program to evaluate postfix expressions.', 1),
  (7, 1, 7, 'Write a C program to perform all queue operations.', 1),
  (8, 1, 8, 'Implement C program based on singly linked lists.', 1),
  (9, 1, 9, 'Implement C program based on trees for creating and deleting a node in binary tree.', 1),
  (10, 1, 10, 'Implement C program to traverse binary search tree (Inorder, Preorder and Postorder) traversal.', 1),
  (11, 1, 11, 'Write a program to implement all the operations on Graph.', 1),
  (12, 1, 12, 'Compute the time and space complexity with Big O for following programs: Addition of 2 numbers, Factorial of a Number and Printing numbers from 1 to 10 using for loop.', 1),
  (13, 2, 1, 'Assemble and test basic logic gates.', 1),
  (14, 2, 2, 'Assemble and test universal and special logic gates.', 1),
  (15, 2, 3, 'Verify Demorgan''s 1st theorem.', 1),
  (16, 2, 4, 'Verify Demorgan''s 2nd theorem.', 1),
  (17, 2, 5, 'Verify 4:1 MUX truth table.', 1),
  (18, 2, 6, 'Verify 1:4 DEMUX truth table.', 1),
  (19, 2, 7, 'Verify truth table of Clocked RS Flipflop.', 1),
  (20, 2, 8, 'Verify truth table of JK Flipflop.', 1),
  (21, 2, 9, 'Verify truth table of Master Slave JK Flipflop.', 1),
  (22, 3, 1, 'Observe components of network in your Computer Network Lab. Draw layout of lab.', 1),
  (23, 3, 2, 'Creating User Account & Applying Account Policies on Standalone Computer.', 1),
  (24, 3, 3, 'Use step by step procedure for File Sharing & Printer Sharing.', 1),
  (25, 3, 4, 'Identify network control devices and study their specifications.', 1),
  (26, 3, 5, 'Connect RJ45 connector to the cable using crimping and prepare a Straight Cable & Cross Over Cable and Test by Line Tester.', 1),
  (27, 3, 6, 'To Connect computers in Star Topology using wired media and any network control device.', 1),
  (28, 3, 7, 'Create a network using Peer-to-Peer Network Model.', 1),
  (29, 3, 8, 'Implementation of Network Commands (ipconfig, tracert, ping, telnet, etc.).', 1),
  (30, 3, 9, 'Installation of TCP/IP Protocol.', 1),
  (31, 3, 10, 'Implementing TCP/IP Network Configuration.', 1),
  (32, 4, 1, 'Knowing the security provided with Windows Operating System.', 1),
  (33, 4, 2, 'Recovery of the password of Windows machines using password recovery utility.', 1),
  (34, 4, 3, 'Tracing of email origin using eMailTracePro utility.', 1),
  (35, 4, 4, 'Use of keylogger and anti-keylogger to secure your system.', 1),
  (36, 4, 5, 'Encrypt and decrypt the message using Simple Transposition-Permutation (Cryptool).', 1),
  (37, 4, 6, 'Encrypt and decrypt a message using Caesar Cipher with Variable.', 1),
  (38, 4, 7, 'Encrypt and decrypt the message using 3 × 3 Hill Cipher (Cryptool).', 1),
  (39, 4, 8, 'Create Digital Signature document using Cryptool.', 1),
  (40, 4, 9, 'Send and receive secret message using Steganography techniques using Steghide.', 1),
  (41, 4, 10, 'Recover the data from formatted Pen Drive and Hard Disk using Power Data Recovery utility or any other utility.', 1);

-- Development account password: LabSim@123 (bcrypt hash, work factor 10).
INSERT IGNORE INTO users
  (name, email, password_hash, role, status)
VALUES
  ('LabSim Faculty', 'faculty@labsim.local', '$2b$10$HTXEblt8fCAgbcq1dikFrOK/Qp7yclbE6oII/fBoO021NoVeBcNtK', 'faculty', 'active');
