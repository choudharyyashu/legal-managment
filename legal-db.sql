-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 13, 2026 at 08:56 AM
-- Server version: 10.11.16-MariaDB
-- PHP Version: 8.5.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `legal-db`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `user_name` varchar(255) NOT NULL,
  `user_role` varchar(50) NOT NULL,
  `action` varchar(100) NOT NULL,
  `resource_type` varchar(50) NOT NULL,
  `resource_id` varchar(100) DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`details`)),
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `timestamp` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `calendar_events`
--

CREATE TABLE `calendar_events` (
  `id` varchar(36) NOT NULL,
  `matter_id` varchar(36) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `event_type` varchar(50) NOT NULL,
  `start_time` datetime(3) NOT NULL,
  `end_time` datetime(3) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `judge` varchar(150) DEFAULT NULL,
  `is_court_appearance` tinyint(1) NOT NULL DEFAULT 0,
  `created_by_user_id` varchar(36) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chart_of_accounts`
--

CREATE TABLE `chart_of_accounts` (
  `account_number` int(11) NOT NULL,
  `account_name` varchar(100) NOT NULL,
  `account_type` varchar(50) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chart_of_accounts`
--

INSERT INTO `chart_of_accounts` (`account_number`, `account_name`, `account_type`, `is_active`) VALUES
(1010, 'Operating Cash Account', 'Asset', 1),
(1020, 'IOLTA Trust Bank Account', 'Asset', 1),
(1200, 'Accounts Receivable', 'Asset', 1),
(2100, 'Client Trust Liability (Escrow)', 'Liability', 1),
(4000, 'Legal Fee Revenue', 'Revenue', 1),
(5000, 'Operating Expenses', 'Expense', 1);

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `id` varchar(36) NOT NULL,
  `client_number` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `client_type` varchar(50) NOT NULL,
  `primary_contact` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `address` text DEFAULT NULL,
  `assigned_attorney_id` varchar(36) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Active',
  `notes` text DEFAULT NULL,
  `portal_access_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `conflict_search_logs`
--

CREATE TABLE `conflict_search_logs` (
  `id` varchar(36) NOT NULL,
  `intake_id` varchar(36) NOT NULL,
  `queried_name` varchar(255) NOT NULL,
  `matched_entity_type` varchar(50) NOT NULL,
  `matched_record_id` varchar(100) NOT NULL,
  `searched_by_user_id` varchar(36) NOT NULL,
  `searched_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` varchar(36) NOT NULL,
  `document_code` varchar(50) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `client_id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `category` varchar(50) NOT NULL,
  `current_version` varchar(20) NOT NULL DEFAULT 'v1.0',
  `is_privileged` tinyint(1) NOT NULL DEFAULT 0,
  `privilege_type` varchar(100) DEFAULT NULL,
  `ocr_content` longtext DEFAULT NULL,
  `bates_number_start` varchar(50) DEFAULT NULL,
  `bates_number_end` varchar(50) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `document_versions`
--

CREATE TABLE `document_versions` (
  `id` varchar(36) NOT NULL,
  `document_id` varchar(36) NOT NULL,
  `version_label` varchar(20) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size_bytes` bigint(20) NOT NULL,
  `s3_storage_key` varchar(500) NOT NULL,
  `sha256_checksum` varchar(64) NOT NULL,
  `uploaded_by_user_id` varchar(36) NOT NULL,
  `revision_notes` text DEFAULT NULL,
  `uploaded_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` varchar(36) NOT NULL,
  `expense_code` varchar(50) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `incurred_by_user_id` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `category` varchar(100) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `vendor_name` varchar(255) DEFAULT NULL,
  `receipt_document_id` varchar(36) DEFAULT NULL,
  `is_billable` tinyint(1) NOT NULL DEFAULT 1,
  `status` varchar(30) NOT NULL DEFAULT 'Unbilled',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `general_ledger_entries`
--

CREATE TABLE `general_ledger_entries` (
  `id` varchar(36) NOT NULL,
  `journal_id` varchar(36) NOT NULL,
  `account_number` int(11) NOT NULL,
  `debit` decimal(12,2) NOT NULL DEFAULT 0.00,
  `credit` decimal(12,2) NOT NULL DEFAULT 0.00,
  `matter_id` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `general_ledger_journals`
--

CREATE TABLE `general_ledger_journals` (
  `id` varchar(36) NOT NULL,
  `journal_number` varchar(50) NOT NULL,
  `transaction_date` date NOT NULL,
  `memo` text NOT NULL,
  `created_by_user_id` varchar(36) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `intakes`
--

CREATE TABLE `intakes` (
  `id` varchar(36) NOT NULL,
  `intake_number` varchar(50) NOT NULL,
  `prospective_client` varchar(255) NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `practice_area_id` varchar(50) DEFAULT NULL,
  `adverse_parties` text NOT NULL,
  `matter_summary` text NOT NULL,
  `dispute_amount` decimal(12,2) DEFAULT 0.00,
  `jurisdiction_venue` varchar(255) DEFAULT NULL,
  `conflict_status` varchar(50) NOT NULL DEFAULT 'Not Started',
  `reviewed_by_user_id` varchar(36) DEFAULT NULL,
  `reviewed_at` datetime(3) DEFAULT NULL,
  `conflict_notes` text DEFAULT NULL,
  `converted_to_client` tinyint(1) NOT NULL DEFAULT 0,
  `converted_client_id` varchar(36) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` varchar(36) NOT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `client_id` varchar(36) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `issue_date` date NOT NULL,
  `due_date` date NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `paid_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `balance_due` decimal(12,2) NOT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'Draft',
  `sent_at` datetime(3) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoice_line_items`
--

CREATE TABLE `invoice_line_items` (
  `id` varchar(36) NOT NULL,
  `invoice_id` varchar(36) NOT NULL,
  `item_type` varchar(20) NOT NULL,
  `time_entry_id` varchar(36) DEFAULT NULL,
  `expense_id` varchar(36) DEFAULT NULL,
  `description` text NOT NULL,
  `quantity` decimal(5,2) NOT NULL,
  `unit_rate` decimal(10,2) NOT NULL,
  `total_price` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `matters`
--

CREATE TABLE `matters` (
  `id` varchar(36) NOT NULL,
  `matter_number` varchar(50) NOT NULL,
  `client_id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `practice_area_id` varchar(50) NOT NULL,
  `current_stage_id` varchar(50) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Active',
  `responsible_attorney_id` varchar(36) NOT NULL,
  `billing_type` varchar(50) NOT NULL,
  `hourly_rate` decimal(10,2) DEFAULT NULL,
  `flat_fee_amount` decimal(12,2) DEFAULT NULL,
  `contingency_percentage` decimal(5,2) DEFAULT NULL,
  `budget` decimal(12,2) NOT NULL DEFAULT 0.00,
  `open_date` date NOT NULL,
  `close_date` date DEFAULT NULL,
  `statute_of_limitations` date DEFAULT NULL,
  `next_court_date` datetime(3) DEFAULT NULL,
  `court_name` varchar(255) DEFAULT NULL,
  `judge` varchar(150) DEFAULT NULL,
  `case_docket_number` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `matter_staff_assignments`
--

CREATE TABLE `matter_staff_assignments` (
  `id` varchar(36) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `assignment_role` varchar(50) NOT NULL,
  `assigned_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `matter_stage_histories`
--

CREATE TABLE `matter_stage_histories` (
  `id` varchar(36) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `from_stage_id` varchar(50) DEFAULT NULL,
  `to_stage_id` varchar(50) NOT NULL,
  `transitioned_by_user_id` varchar(36) NOT NULL,
  `verified_gatekeepers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`verified_gatekeepers`)),
  `transitioned_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_records`
--

CREATE TABLE `payment_records` (
  `id` varchar(36) NOT NULL,
  `payment_reference` varchar(50) NOT NULL,
  `invoice_id` varchar(36) NOT NULL,
  `client_id` varchar(36) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `destination_account` varchar(50) NOT NULL,
  `transaction_reference` varchar(100) DEFAULT NULL,
  `received_date` date NOT NULL,
  `recorded_by_user_id` varchar(36) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `practice_areas`
--

CREATE TABLE `practice_areas` (
  `id` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `code` varchar(10) NOT NULL,
  `brand_color` varchar(20) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `practice_areas`
--

INSERT INTO `practice_areas` (`id`, `name`, `code`, `brand_color`, `is_active`) VALUES
('pa-app', 'Appeals', 'APP', '#4f46e5', 1),
('pa-bk', 'Bankruptcy', 'BK', '#0284c7', 1),
('pa-civ', 'Civil/Commercial Litigation', 'CIV', '#2563eb', 1),
('pa-crim', 'Criminal Defense', 'CRIM', '#ef4444', 1),
('pa-evict', 'Landlord-Tenant/Evictions', 'EVICT', '#d97706', 1),
('pa-fam', 'Family Law', 'FAM', '#ec4899', 1),
('pa-imm', 'Immigration', 'IMM', '#059669', 1),
('pa-pi', 'Personal Injury', 'PI', '#ea580c', 1),
('pa-prob', 'Probate', 'PROB', '#8b5cf6', 1);

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `created_at`) VALUES
('attorney', 'Attorney', 'Case file management, litigation dockets, client advisory, time logging, and personal workload.', '2026-11-13 07:39:36.862'),
('billing', 'Billing / Accounting Staff', 'Invoicing, disbursements, fee accounting, receivables, and official CosmoLex ledger synchronization.', '2026-11-13 07:39:36.868'),
('paralegal', 'Paralegal / Staff', 'Litigation support, court filings, document repository management, and task checklists.', '2026-11-13 07:39:36.866'),
('super_admin', 'Super Admin', 'Full administrative control, user governance, security policies, and firm-wide ledger visibility.', '2026-11-13 07:39:36.856'),
('supervisor', 'Supervisor', 'Cross-matter oversight, department workload balancing, and partner time-entry approval queues.', '2026-11-13 07:39:36.870');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` varchar(36) NOT NULL,
  `role_id` varchar(50) NOT NULL,
  `permission_key` varchar(100) NOT NULL,
  `granted_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`id`, `role_id`, `permission_key`, `granted_at`) VALUES
('005c92fd-f6b0-4c22-bd3f-523fadeb9c1d', 'super_admin', 'matters:view', '2026-11-13 07:39:36.914'),
('02f3adf3-46bc-426f-9d99-936da2e7294c', 'super_admin', 'operating:view', '2026-11-13 07:39:37.004'),
('037d1662-84d3-4c3e-b385-43a1e75a31c3', 'super_admin', 'expenses:view', '2026-11-13 07:39:36.980'),
('05a44d2a-5814-4ce1-930e-dff40f237e73', 'super_admin', 'calendar:view', '2026-11-13 07:39:36.953'),
('070983f4-11f3-4235-b6c8-289f5bfe5671', 'supervisor', 'deadlines:view', '2026-11-13 07:39:37.373'),
('071e6522-1306-4ca1-bee0-5b1137b8f1d4', 'super_admin', 'matters:delete', '2026-11-13 07:39:36.920'),
('08d10416-0463-41b1-840b-126cd463a9d0', 'super_admin', 'communications:manage', '2026-11-13 07:39:36.937'),
('0a3878ce-4f96-4850-9e5c-6ddea2dbbfae', 'attorney', 'clients:create', '2026-11-13 07:39:37.073'),
('0a9501b6-29be-4428-a6bd-dbe5ee3743b7', 'billing', 'billing:reports_view', '2026-11-13 07:39:37.297'),
('0dc376e7-7074-472e-8125-924de79e2aa3', 'supervisor', 'documents:view', '2026-11-13 07:39:37.348'),
('0e73fe49-7251-4269-a5c8-753dc7220d2c', 'super_admin', 'cosmolex:view', '2026-11-13 07:39:37.009'),
('0fbd0175-1af2-4898-8bf5-50a1601a75f6', 'paralegal', 'matters:view', '2026-11-13 07:39:37.173'),
('1146ec99-bf63-4e3b-8fb6-faf14c7d71b4', 'supervisor', 'time:review_own', '2026-11-13 07:39:37.377'),
('1a68c2d3-3f78-459a-8df5-effed8dab155', 'super_admin', 'deadlines:view', '2026-11-13 07:39:36.955'),
('1d582f9c-2141-47a2-a097-a3da54480c87', 'supervisor', 'time:review_team', '2026-11-13 07:39:37.380'),
('1f1deb36-5abc-4a63-813a-5c58f3c3f2d6', 'billing', 'billing:hours_view', '2026-11-13 07:39:37.272'),
('1f636074-eb96-42ef-a2e1-fee72b9f9d20', 'supervisor', 'notifications:manage', '2026-11-13 07:39:37.425'),
('209f6139-23e1-41e9-93e6-fdb3078602ce', 'billing', 'matters:view', '2026-11-13 07:39:37.252'),
('20f71b65-f04a-430c-834f-3b334e8b0e53', 'billing', 'notifications:manage', '2026-11-13 07:39:37.315'),
('21054aa4-f913-4ecd-9038-2d9eccd07523', 'paralegal', 'time:log', '2026-11-13 07:39:37.217'),
('21f0e5c9-2562-4f90-80d7-fb7461f4d33f', 'supervisor', 'time:reject', '2026-11-13 07:39:37.386'),
('235706a4-dcc5-4bdf-b61b-52e6d7f00ee4', 'super_admin', 'clients:delete', '2026-11-13 07:39:36.911'),
('25d34bd0-7132-4aab-8053-3683ee638a23', 'supervisor', 'templates:view', '2026-11-13 07:39:37.420'),
('26cea092-4247-4b67-9bec-9621cba7876b', 'paralegal', 'communications:manage', '2026-11-13 07:39:37.191'),
('2845b3ba-3b1a-4db4-83a2-f3149867c28a', 'paralegal', 'checklists:manage', '2026-11-13 07:39:37.230'),
('2863b860-ff53-4b98-8b13-52cebc05a2e2', 'super_admin', 'tasks:delete', '2026-11-13 07:39:36.951'),
('29d00561-f5c8-4d2e-8c2e-08cc37fd5f5c', 'paralegal', 'dashboard:view', '2026-11-13 07:39:37.167'),
('2a92b607-9397-4caf-85ca-9fe779ecdc72', 'attorney', 'reports:staff_view', '2026-11-13 07:39:37.155'),
('2dd9b43b-7d3e-48f7-849d-e45366403436', 'billing', 'clients:view', '2026-11-13 07:39:37.249'),
('2ee41a6c-0aa5-4820-b193-da73b02bde16', 'super_admin', 'branding:manage', '2026-11-13 07:39:37.052'),
('2f4c00ca-bdc0-4312-9c2d-880aded4dcf5', 'attorney', 'documents:view', '2026-11-13 07:39:37.096'),
('2f5a52bc-54c2-4d3e-be1d-58aeb3aa69c8', 'supervisor', 'communications:view', '2026-11-13 07:39:37.353'),
('30444d98-294d-4ccb-848c-6d9baccc07f7', 'paralegal', 'deadlines:view', '2026-11-13 07:39:37.213'),
('30dcd7de-fc30-4d2e-809f-d30cbc36b07c', 'super_admin', 'dashboard:approvals_view', '2026-11-13 07:39:36.903'),
('3139e58c-6b6b-4236-8c14-760309ae8679', 'super_admin', 'users:manage', '2026-11-13 07:39:37.026'),
('31a0884d-69ad-49ba-833f-081dd2235a7f', 'billing', 'cosmolex:export', '2026-11-13 07:39:37.307'),
('3261ab5b-c72f-4a1b-8ce0-8837de7329e8', 'attorney', 'calendar:view', '2026-11-13 07:39:37.122'),
('32ddac8d-ca3e-44a9-ae5f-48900001a0dc', 'paralegal', 'documents:view', '2026-11-13 07:39:37.183'),
('3305c1c8-c884-4884-9e8a-92ea3e7a2b87', 'attorney', 'tasks:view_team', '2026-11-13 07:39:37.115'),
('33c495de-c295-466f-b3a7-c48f88ec2a41', 'attorney', 'matters:create', '2026-11-13 07:39:37.081'),
('3558df8c-b941-4c69-9e02-8d2d10b421fd', 'super_admin', 'integrations:manage', '2026-11-13 07:39:37.049'),
('378b1d13-db3a-4621-b3ca-8c78582ce206', 'supervisor', 'tasks:view_own', '2026-11-13 07:39:37.361'),
('3b59a7fa-371f-4c33-9260-674b14730b34', 'paralegal', 'expenses:create', '2026-11-13 07:39:37.236'),
('3f405b33-c14a-46c6-82e6-ca2b6e8c3247', 'billing', 'billing:overview_view', '2026-11-13 07:39:37.269'),
('40298537-06fa-4f1f-95a5-737fbc4d6847', 'supervisor', 'time:suggested_view', '2026-11-13 07:39:37.383'),
('404bb7d1-fc8b-494c-9e59-3d4b2baacf7e', 'super_admin', 'templates:manage', '2026-11-13 07:39:37.037'),
('409bafa5-538a-4ec9-9da4-7d78f9c49ed2', 'attorney', 'clients:view', '2026-11-13 07:39:37.070'),
('40f42a9c-3223-4496-9d67-00f4e187335c', 'super_admin', 'time:approve', '2026-11-13 07:39:36.966'),
('41207bd5-ebf0-4438-9f2c-e60fbff53405', 'billing', 'reports:export', '2026-11-13 07:39:37.312'),
('4132227f-0631-440c-a84f-4170dc9fd57f', 'super_admin', 'tasks:view_own', '2026-11-13 07:39:36.942'),
('420241b6-11e0-4e7d-9028-fad459d5e8ea', 'attorney', 'dashboard:workload_view', '2026-11-13 07:39:37.067'),
('4243dfd9-b7ac-40b8-9c1f-534598d00636', 'attorney', 'reports:matter_view', '2026-11-13 07:39:37.158'),
('444c0ca3-c029-4b4c-bbb7-48dfd1d1fe10', 'super_admin', 'time:suggested_view', '2026-11-13 07:39:36.964'),
('448627af-1593-44a5-8b01-301d01387d60', 'super_admin', 'dashboard:view', '2026-11-13 07:39:36.897'),
('4556bbd0-5432-4172-b5fe-83154b09bb52', 'super_admin', 'tasks:edit', '2026-11-13 07:39:36.949'),
('47f4d686-97af-487f-a37f-6a55ef584f6c', 'super_admin', 'checklists:manage', '2026-11-13 07:39:36.973'),
('4829107f-8c3f-4f1c-929e-025b65409d9b', 'attorney', 'expenses:create', '2026-11-13 07:39:37.152'),
('48f65d03-5ca9-4566-a3ac-666ce4b98855', 'attorney', 'clients:edit', '2026-11-13 07:39:37.076'),
('4b959c82-f6da-4948-9471-a292ff3cdea7', 'supervisor', 'time:approve', '2026-11-13 07:39:37.384'),
('4c26d77b-ede3-4222-b73c-d99a5441c624', 'super_admin', 'dashboard:workload_view', '2026-11-13 07:39:36.901'),
('4ca73a3b-d334-4557-a48e-25b419f74c11', 'super_admin', 'documents:upload', '2026-11-13 07:39:36.931'),
('4ebf61a2-5a4d-4570-8e52-b78d3cfeb892', 'paralegal', 'templates:view', '2026-11-13 07:39:37.239'),
('4ed201e2-ac9c-44e4-bcb2-bff9b6b79ab2', 'super_admin', 'payments:view', '2026-11-13 07:39:36.996'),
('4f124ed1-5d11-4fd6-961e-34b6448853c6', 'supervisor', 'matters:view', '2026-11-13 07:39:37.332'),
('4f824143-cf91-4aec-bd2a-cf1f02318647', 'super_admin', 'trust:view', '2026-11-13 07:39:37.006'),
('4fa3b7cf-1c87-4d0a-8f4c-49bff6b6d168', 'attorney', 'intake:view', '2026-11-13 07:39:37.087'),
('5019f5ca-2e3d-4a7c-b3a9-4bc9ff7a329b', 'supervisor', 'matters:create', '2026-11-13 07:39:37.335'),
('523adb25-b675-493e-ad63-9b2b158b9347', 'super_admin', 'clients:create', '2026-11-13 07:39:36.907'),
('525a016c-5da9-41a3-ba43-cb9c438b3e3f', 'supervisor', 'portal:preview', '2026-11-13 07:39:37.358'),
('5328b0b9-60b1-4baa-8f2f-98726758da99', 'paralegal', 'calendar:view', '2026-11-13 07:39:37.211'),
('560d0193-cef1-4094-821b-cbf74349b280', 'paralegal', 'tasks:view_team', '2026-11-13 07:39:37.203'),
('560ee21f-4b6d-4c0d-9f80-455b7c624a4e', 'supervisor', 'billing:overview_view', '2026-11-13 07:39:37.392'),
('56746df7-6c83-4dc5-91c8-3b707075a039', 'supervisor', 'dashboard:workload_view', '2026-11-13 07:39:37.319'),
('567b4598-cc08-4268-ae2c-19159e79d6a5', 'supervisor', 'checklists:manage', '2026-11-13 07:39:37.390'),
('593d752e-9337-4649-8f9b-b2fd2b251978', 'attorney', 'expenses:view', '2026-11-13 07:39:37.150'),
('5af6a2a3-60a1-4031-8dc4-ad56c588bfa7', 'super_admin', 'matters:create', '2026-11-13 07:39:36.916'),
('5b01025e-0784-41f2-a4cc-6287f1d1d076', 'billing', 'invoices:view', '2026-11-13 07:39:37.283'),
('5bca675a-4e8f-4332-8108-4bfc1523b2d9', 'attorney', 'checklists:view', '2026-11-13 07:39:37.137'),
('5d7374a5-990f-488f-951b-3fd6b6dac01a', 'super_admin', 'payments:record', '2026-11-13 07:39:36.999'),
('5ff7e463-037a-4c46-bcc3-097aaf339ceb', 'super_admin', 'notifications:manage', '2026-11-13 07:39:37.055'),
('60f06f72-71e9-4784-9fd7-9a148df7c2b4', 'attorney', 'communications:manage', '2026-11-13 07:39:37.106'),
('6284b5e6-7696-45b9-8982-8ea7f0896ab5', 'supervisor', 'expenses:view', '2026-11-13 07:39:37.407'),
('64c9baf8-9ba3-472b-a4e7-d087906f1aaa', 'super_admin', 'billing:hours_view', '2026-11-13 07:39:36.977'),
('6605653b-3909-47b1-8be9-27994d6f705e', 'paralegal', 'tasks:create', '2026-11-13 07:39:37.205'),
('665deed5-a098-48e7-875b-d934de8bb422', 'super_admin', 'security:manage', '2026-11-13 07:39:37.061'),
('667a0bd8-3f91-4a73-9dba-42e9f05beed4', 'attorney', 'time:review_own', '2026-11-13 07:39:37.131'),
('69d5bb21-a53b-47cd-b6b6-1aa845278168', 'supervisor', 'billing:hours_view', '2026-11-13 07:39:37.404'),
('6a0f4cce-d99e-498b-a2c8-9a026aa91de4', 'attorney', 'intake:conflict_review', '2026-11-13 07:39:37.093'),
('6a8a3b6b-1e41-4f55-bf76-46efd79a315f', 'billing', 'payments:view', '2026-11-13 07:39:37.291'),
('6b38c9d9-2188-4379-8026-14b26b747b6a', 'super_admin', 'portal:preview', '2026-11-13 07:39:36.940'),
('6bb0cd63-a4ea-4d0a-8761-33a91b5cca75', 'super_admin', 'time:review_own', '2026-11-13 07:39:36.959'),
('6c211e40-3613-471e-b96c-3c62cdd56673', 'billing', 'dashboard:view', '2026-11-13 07:39:37.246'),
('6f07726a-2071-460e-94f5-ef22085a9527', 'paralegal', 'expenses:view', '2026-11-13 07:39:37.233'),
('700ae968-9ed0-4962-a6cb-055e059f722b', 'supervisor', 'clients:edit', '2026-11-13 07:39:37.329'),
('73b56302-4e08-4daf-9a56-7ae0b37a9c9f', 'supervisor', 'calendar:view', '2026-11-13 07:39:37.371'),
('74b2bfa1-c591-4dd8-a8b4-4904b7a0dd01', 'attorney', 'intake:create', '2026-11-13 07:39:37.090'),
('77207133-9dfb-49b6-adda-2a6583e5ddcf', 'paralegal', 'tasks:edit', '2026-11-13 07:39:37.208'),
('77c58a3e-cf97-494b-a862-69d9b38881ca', 'attorney', 'documents:upload', '2026-11-13 07:39:37.099'),
('7bcca790-f0b5-4629-a1bc-c9e573016b0f', 'super_admin', 'time:log', '2026-11-13 07:39:36.957'),
('7be839fa-70ee-4270-a67d-8987d356aed8', 'paralegal', 'time:suggested_view', '2026-11-13 07:39:37.223'),
('8275a21c-f4a9-4521-919c-8e9b2aa9a5eb', 'super_admin', 'intake:view', '2026-11-13 07:39:36.922'),
('8330a0d0-7331-485c-bcb5-08089177de16', 'attorney', 'tasks:edit', '2026-11-13 07:39:37.119'),
('835c4014-8b6b-425b-867d-da30c1260cad', 'billing', 'expenses:create', '2026-11-13 07:39:37.278'),
('8610e3c9-d09f-4039-b137-b9a65050eef1', 'paralegal', 'documents:upload', '2026-11-13 07:39:37.186'),
('8927ab38-83c3-4538-939c-fca9b10df09b', 'billing', 'operating:view', '2026-11-13 07:39:37.299'),
('89bb2413-91ee-47b0-87af-e5cd9ac0b80b', 'billing', 'reports:financial_view', '2026-11-13 07:39:37.309'),
('89e9e22f-af37-4baa-b1e1-feedad21cc12', 'supervisor', 'matters:edit', '2026-11-13 07:39:37.337'),
('8a4e357e-cd91-4e84-83df-bd72c86deaa3', 'super_admin', 'reports:export', '2026-11-13 07:39:37.021'),
('8a8fb1b2-21e7-425c-b4e8-6abe0ae1b9c5', 'attorney', 'matters:edit', '2026-11-13 07:39:37.084'),
('8c3377a1-f840-4ae1-be6f-09b1578415d9', 'super_admin', 'documents:delete', '2026-11-13 07:39:36.933'),
('8db44013-2bc3-4dd9-9a06-7cb51a690494', 'super_admin', 'cosmolex:export', '2026-11-13 07:39:37.011'),
('8df4aee3-810e-4c72-81bb-4a644f0b30c6', 'attorney', 'checklists:manage', '2026-11-13 07:39:37.140'),
('8e5db45d-8333-4ac9-a893-a06c063105de', 'supervisor', 'dashboard:view', '2026-11-13 07:39:37.317'),
('90705ec7-4855-4f34-9757-9b896af91b22', 'super_admin', 'time:review_team', '2026-11-13 07:39:36.961'),
('908f4fce-e6ad-41df-a33a-5fb80d0c3f8a', 'attorney', 'deadlines:view', '2026-11-13 07:39:37.126'),
('90b313ea-3bd0-439e-a1c9-7eb68bfff9f2', 'supervisor', 'tasks:edit', '2026-11-13 07:39:37.368'),
('91d521e7-52db-40f4-aa57-0817f4678690', 'paralegal', 'tasks:view_own', '2026-11-13 07:39:37.200'),
('9401fbbb-3a15-4622-836a-619db9d02466', 'paralegal', 'intake:view', '2026-11-13 07:39:37.176'),
('958ca7e4-0385-42d9-843f-fe193a2034a5', 'attorney', 'time:log', '2026-11-13 07:39:37.129'),
('95ba384d-08fa-4930-a08f-92445b7b5b32', 'super_admin', 'intake:conflict_review', '2026-11-13 07:39:36.927'),
('97216c0e-0c5d-4e3f-a7b8-75e52939dc82', 'paralegal', 'clients:view', '2026-11-13 07:39:37.170'),
('9864a751-7f38-4012-b487-f136059991bc', 'billing', 'invoices:manage', '2026-11-13 07:39:37.288'),
('9cb59388-e524-467e-9bb4-3efd3459be8b', 'super_admin', 'integrations:view', '2026-11-13 07:39:37.040'),
('9feb6f7c-2b85-4984-8317-c7e6fed3cea6', 'super_admin', 'tasks:view_team', '2026-11-13 07:39:36.944'),
('a1bab09f-b560-4386-828d-677ad2c83aa3', 'supervisor', 'intake:view', '2026-11-13 07:39:37.340'),
('a295f3e3-332d-4878-af35-fcf290cc85d7', 'supervisor', 'documents:upload', '2026-11-13 07:39:37.351'),
('a49e4522-acb5-4c57-8fe5-e0deed66f0bc', 'supervisor', 'reports:staff_view', '2026-11-13 07:39:37.412'),
('a79f363b-abcb-49a9-a891-2f041128ce3a', 'super_admin', 'clients:edit', '2026-11-13 07:39:36.909'),
('a8f9eb89-0955-4de8-85aa-d82507130426', 'supervisor', 'time:log', '2026-11-13 07:39:37.375'),
('aa79e01a-edfb-49ba-9d03-239373024e82', 'supervisor', 'intake:conflict_review', '2026-11-13 07:39:37.345'),
('ac2b4939-22f4-4f5e-9c6e-3f230fd6faba', 'billing', 'time:review_own', '2026-11-13 07:39:37.266'),
('ac60b2cb-2b9f-4e1e-9d41-f399b2414c68', 'super_admin', 'intake:create', '2026-11-13 07:39:36.924'),
('ae47fb0d-73ae-4d64-bf8f-02483095e6e9', 'attorney', 'billing:overview_view', '2026-11-13 07:39:37.144'),
('af327a6a-18c4-4928-a6e7-177c38703351', 'super_admin', 'expenses:edit', '2026-11-13 07:39:36.985'),
('afb2cfa3-30b4-42a2-98eb-59f2a423a91a', 'super_admin', 'tasks:create', '2026-11-13 07:39:36.946'),
('b03b4c83-05b6-4d21-ba0f-188371ea19b9', 'super_admin', 'documents:view', '2026-11-13 07:39:36.929'),
('b1263644-d000-4aea-a96b-a691d30a8490', 'paralegal', 'portal:preview', '2026-11-13 07:39:37.197'),
('b3d47ac5-3ae4-470e-a4e5-b96e0ead7d41', 'attorney', 'templates:view', '2026-11-13 07:39:37.161'),
('b62f6994-8ad3-4409-8aa6-42ef58d3af31', 'super_admin', 'billing:reports_view', '2026-11-13 07:39:37.001'),
('b8077134-b8cf-4380-81bf-28028bfbe2c4', 'paralegal', 'notifications:manage', '2026-11-13 07:39:37.243'),
('b81dd8e8-7fce-4345-af6c-3e1fa9fa662d', 'supervisor', 'dashboard:approvals_view', '2026-11-13 07:39:37.322'),
('b86156cd-d95a-4f63-a7ee-55f10d7354bb', 'super_admin', 'invoices:view', '2026-11-13 07:39:36.988'),
('b9c62a36-6499-4002-ad07-225aed403cb9', 'super_admin', 'templates:view', '2026-11-13 07:39:37.034'),
('bb18dd8d-c52e-485f-8429-9bca9333a709', 'attorney', 'portal:preview', '2026-11-13 07:39:37.109'),
('bc691e32-7966-4352-a387-04007b3d1992', 'super_admin', 'reports:matter_view', '2026-11-13 07:39:37.016'),
('bdb633a0-5a61-4e26-b8ce-bc70f1a4bcaa', 'super_admin', 'invoices:manage', '2026-11-13 07:39:36.993'),
('bf99bcf0-0113-4684-bfdd-44b256b1b526', 'super_admin', 'roles:view', '2026-11-13 07:39:37.028'),
('c29b6757-84ee-4e76-ab6d-97d4827970b4', 'super_admin', 'roles:manage', '2026-11-13 07:39:37.031'),
('c592ef5e-199f-4330-aa48-555ebe1d8a45', 'attorney', 'tasks:create', '2026-11-13 07:39:37.117'),
('c5a7e799-de07-4cab-b49b-222de1d205e2', 'billing', 'tasks:view_own', '2026-11-13 07:39:37.258'),
('c5adc8a3-0b4b-44e6-b179-8d56dfa15006', 'attorney', 'tasks:view_own', '2026-11-13 07:39:37.112'),
('c6b41d00-037e-4185-a2a8-0b2af4f4da13', 'super_admin', 'invoices:create', '2026-11-13 07:39:36.991'),
('c8e84c03-3aa3-4276-a1bf-e44d06200918', 'billing', 'cosmolex:view', '2026-11-13 07:39:37.304'),
('c913af7f-4539-4042-ab7d-621744b61cc7', 'supervisor', 'expenses:create', '2026-11-13 07:39:37.409'),
('c9adb8a4-0847-4a6e-a79c-a64636f2025f', 'billing', 'calendar:view', '2026-11-13 07:39:37.260'),
('cadeb96f-c3aa-4b2c-99d6-d041590fffc4', 'attorney', 'time:suggested_view', '2026-11-13 07:39:37.134'),
('cb0c2b12-24fc-492e-9d37-d0d3f5855f2d', 'paralegal', 'intake:create', '2026-11-13 07:39:37.179'),
('cb49b5c2-813d-47a0-9c62-3a0291d61454', 'paralegal', 'time:review_own', '2026-11-13 07:39:37.220'),
('cda53d26-82cf-4007-9257-2ed6b305077b', 'supervisor', 'templates:manage', '2026-11-13 07:39:37.422'),
('d06bb3ff-9e39-4d9b-9e55-7fd56e88f35c', 'super_admin', 'clients:view', '2026-11-13 07:39:36.905'),
('d22283dc-8e55-4fd6-8c21-0b9665e37839', 'super_admin', 'audit_logs:view', '2026-11-13 07:39:37.058'),
('d294046f-b6bf-4fa8-a9ca-66429ab57af3', 'attorney', 'matters:view', '2026-11-13 07:39:37.079'),
('d8591a3b-c5b1-4d68-9d3c-a38d7f24d82d', 'supervisor', 'reports:matter_view', '2026-11-13 07:39:37.414'),
('da4fe7d4-e8d5-4a0f-aad8-2ad5e8489319', 'billing', 'expenses:edit', '2026-11-13 07:39:37.280'),
('db033b53-8149-4204-b941-9f4d7d828e5d', 'supervisor', 'checklists:view', '2026-11-13 07:39:37.388'),
('dcf9c054-7057-4dd9-bdb8-f80891a1edfe', 'billing', 'payments:record', '2026-11-13 07:39:37.294'),
('dd5d72c9-8b3e-4850-8838-1371ea843580', 'super_admin', 'time:reject', '2026-11-13 07:39:36.969'),
('ddd16ece-ad8c-4fd7-85d8-de65ba0637c4', 'billing', 'portal:preview', '2026-11-13 07:39:37.255'),
('de6e125d-5445-4085-8a61-8d5c8cb63164', 'supervisor', 'clients:view', '2026-11-13 07:39:37.324'),
('de6e6b60-423b-4b8e-8bbc-a4c7dd710db3', 'supervisor', 'intake:create', '2026-11-13 07:39:37.342'),
('e17089ae-1d53-4a87-b350-1625563cb3fa', 'attorney', 'communications:view', '2026-11-13 07:39:37.102'),
('e192d708-8bc2-43be-9774-17ee30a4f793', 'billing', 'time:log', '2026-11-13 07:39:37.264'),
('e29a8de3-3775-4bd9-8b30-4631459de7a2', 'attorney', 'dashboard:view', '2026-11-13 07:39:37.064'),
('e45ec3fb-3ee7-47b3-9700-c263e5f11f19', 'super_admin', 'communications:view', '2026-11-13 07:39:36.935'),
('e4c4ae24-393c-463e-9399-e62acab20dcc', 'super_admin', 'reports:staff_view', '2026-11-13 07:39:37.014'),
('e59b703c-2031-4d4b-88b5-14f33992973a', 'attorney', 'notifications:manage', '2026-11-13 07:39:37.164'),
('e665bc4d-0855-45ed-8fc9-46f7d62d3963', 'supervisor', 'clients:create', '2026-11-13 07:39:37.326'),
('e74a7662-e346-43d0-8f66-a74ac1a83e90', 'super_admin', 'matters:edit', '2026-11-13 07:39:36.918'),
('e98b82e7-71bf-4acd-a837-5fda686bd4c9', 'super_admin', 'expenses:create', '2026-11-13 07:39:36.982'),
('e9935623-401a-49c9-ba14-45c4a3bcf5ce', 'supervisor', 'communications:manage', '2026-11-13 07:39:37.356'),
('e99b8c52-3894-4cd9-b2c2-03e6857a8205', 'attorney', 'billing:hours_view', '2026-11-13 07:39:37.147'),
('ea907337-29ec-4c2f-a0f0-287c58d65b3a', 'supervisor', 'tasks:create', '2026-11-13 07:39:37.365'),
('eb0f26d7-6176-4b86-8e1c-af268346a51f', 'super_admin', 'reports:financial_view', '2026-11-13 07:39:37.019'),
('eb2fa8b2-692c-44f4-8087-eaa431e52340', 'super_admin', 'billing:overview_view', '2026-11-13 07:39:36.975'),
('eb40dc78-75a0-487a-a96e-c12e9881b09e', 'paralegal', 'checklists:view', '2026-11-13 07:39:37.226'),
('ef8665b7-469c-4032-8ae7-5fd21a25b497', 'supervisor', 'tasks:view_team', '2026-11-13 07:39:37.363'),
('f0ae8df9-ab51-44b9-a297-88df8c04070f', 'billing', 'trust:view', '2026-11-13 07:39:37.302'),
('f25a1f27-e9d8-4158-b1c1-bca7dfa37b0d', 'billing', 'expenses:view', '2026-11-13 07:39:37.275'),
('f36595b9-8fc5-44ae-b0f8-656e370d9b7c', 'paralegal', 'communications:view', '2026-11-13 07:39:37.188'),
('f902edc0-6cd9-48cc-a9c5-19251f7ef726', 'billing', 'invoices:create', '2026-11-13 07:39:37.285'),
('f9ba78a3-c49c-4ee8-a683-269460d713c2', 'super_admin', 'users:view', '2026-11-13 07:39:37.024'),
('fcd0bf81-5876-4394-b67e-52add2d759e3', 'supervisor', 'reports:export', '2026-11-13 07:39:37.417'),
('fde7045b-162d-4131-951e-b636c8706843', 'super_admin', 'checklists:view', '2026-11-13 07:39:36.971');

-- --------------------------------------------------------

--
-- Table structure for table `suggested_billing_captures`
--

CREATE TABLE `suggested_billing_captures` (
  `id` varchar(36) NOT NULL,
  `source_type` varchar(50) NOT NULL,
  `source_identifier` varchar(255) NOT NULL,
  `matter_id` varchar(36) DEFAULT NULL,
  `date` date NOT NULL,
  `actual_duration_seconds` int(11) NOT NULL,
  `suggested_hours` decimal(4,2) NOT NULL,
  `match_confidence` int(11) NOT NULL,
  `activity_description` text NOT NULL,
  `detected_rate` decimal(10,2) DEFAULT NULL,
  `is_converted` tinyint(1) NOT NULL DEFAULT 0,
  `converted_time_entry_id` varchar(36) DEFAULT NULL,
  `is_dismissed` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` varchar(36) NOT NULL,
  `task_code` varchar(50) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `assigned_to_user_id` varchar(36) NOT NULL,
  `created_by_user_id` varchar(36) NOT NULL,
  `due_date` date NOT NULL,
  `priority` varchar(20) NOT NULL DEFAULT 'Medium',
  `status` varchar(30) NOT NULL DEFAULT 'Not Started',
  `completed_at` datetime(3) DEFAULT NULL,
  `reminder_setting` varchar(50) DEFAULT '1 day prior',
  `urcp_rule_reference` varchar(50) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `three_way_reconciliations`
--

CREATE TABLE `three_way_reconciliations` (
  `id` varchar(36) NOT NULL,
  `reconciliation_month` varchar(7) NOT NULL,
  `bank_statement_balance` decimal(12,2) NOT NULL,
  `deposits_in_transit` decimal(12,2) NOT NULL DEFAULT 0.00,
  `outstanding_checks` decimal(12,2) NOT NULL DEFAULT 0.00,
  `adjusted_bank_balance` decimal(12,2) NOT NULL,
  `gl_trust_liability_balance` decimal(12,2) NOT NULL,
  `client_subledgers_total_balance` decimal(12,2) NOT NULL,
  `reconciliation_variance` decimal(12,2) NOT NULL,
  `is_balanced` tinyint(1) NOT NULL,
  `audited_by_user_id` varchar(36) NOT NULL,
  `audit_certificate_pdf_url` text DEFAULT NULL,
  `reconciled_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `time_entries`
--

CREATE TABLE `time_entries` (
  `id` varchar(36) NOT NULL,
  `entry_code` varchar(50) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `hours` decimal(5,2) NOT NULL,
  `rate` decimal(10,2) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `activity_type` varchar(100) NOT NULL,
  `activity_code` varchar(50) DEFAULT NULL,
  `description` text NOT NULL,
  `is_billable` tinyint(1) NOT NULL DEFAULT 1,
  `status` varchar(30) NOT NULL DEFAULT 'Submitted',
  `approved_by_user_id` varchar(36) DEFAULT NULL,
  `approved_at` datetime(3) DEFAULT NULL,
  `rejection_comment` text DEFAULT NULL,
  `exported_to_cosmolex` tinyint(1) NOT NULL DEFAULT 0,
  `export_batch_id` varchar(50) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trust_sub_ledgers`
--

CREATE TABLE `trust_sub_ledgers` (
  `id` varchar(36) NOT NULL,
  `ledger_code` varchar(50) NOT NULL,
  `client_id` varchar(36) NOT NULL,
  `matter_id` varchar(36) NOT NULL,
  `balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `last_audit_date` date NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trust_transactions`
--

CREATE TABLE `trust_transactions` (
  `id` varchar(36) NOT NULL,
  `trust_sub_ledger_id` varchar(36) NOT NULL,
  `transaction_type` varchar(50) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `running_balance` decimal(12,2) NOT NULL,
  `source_reference` varchar(100) NOT NULL,
  `authorized_by_user_id` varchar(36) NOT NULL,
  `purpose` text NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `user_code` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `role` varchar(50) NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `initials` varchar(10) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `billing_rate` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` varchar(20) NOT NULL DEFAULT 'Active',
  `mfa_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `mfa_secret` varchar(255) DEFAULT NULL,
  `last_login_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `workflow_stages`
--

CREATE TABLE `workflow_stages` (
  `id` varchar(50) NOT NULL,
  `practice_area_id` varchar(50) NOT NULL,
  `stage_name` varchar(150) NOT NULL,
  `stage_code` varchar(20) NOT NULL,
  `stage_order` int(11) NOT NULL,
  `required_fields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`required_fields`)),
  `auto_tasks` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`auto_tasks`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('5e3c3502-8397-4d3d-bf99-7e593ebd9368', '681d1d95d3b13bc38f590e5044b56bd8eaeb04fc17dd4cbc7502fdcf9f2f2f2e', '2026-11-13 07:38:56.519', '20261113071216_init', NULL, NULL, '2026-11-13 07:38:54.871', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audit_timestamp` (`timestamp`),
  ADD KEY `idx_audit_resource` (`resource_type`,`resource_id`),
  ADD KEY `audit_logs_user_id_fkey` (`user_id`);

--
-- Indexes for table `calendar_events`
--
ALTER TABLE `calendar_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `calendar_events_matter_id_fkey` (`matter_id`),
  ADD KEY `calendar_events_created_by_user_id_fkey` (`created_by_user_id`);

--
-- Indexes for table `chart_of_accounts`
--
ALTER TABLE `chart_of_accounts`
  ADD PRIMARY KEY (`account_number`);

--
-- Indexes for table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `clients_client_number_key` (`client_number`),
  ADD KEY `idx_clients_search` (`name`,`email`,`client_number`),
  ADD KEY `clients_assigned_attorney_id_fkey` (`assigned_attorney_id`);

--
-- Indexes for table `conflict_search_logs`
--
ALTER TABLE `conflict_search_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `conflict_search_logs_intake_id_fkey` (`intake_id`),
  ADD KEY `conflict_search_logs_searched_by_user_id_fkey` (`searched_by_user_id`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `documents_document_code_key` (`document_code`),
  ADD KEY `documents_matter_id_fkey` (`matter_id`),
  ADD KEY `documents_client_id_fkey` (`client_id`);

--
-- Indexes for table `document_versions`
--
ALTER TABLE `document_versions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `document_versions_document_id_version_label_key` (`document_id`,`version_label`),
  ADD KEY `document_versions_uploaded_by_user_id_fkey` (`uploaded_by_user_id`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `expenses_expense_code_key` (`expense_code`),
  ADD KEY `expenses_matter_id_fkey` (`matter_id`),
  ADD KEY `expenses_incurred_by_user_id_fkey` (`incurred_by_user_id`);

--
-- Indexes for table `general_ledger_entries`
--
ALTER TABLE `general_ledger_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `general_ledger_entries_journal_id_fkey` (`journal_id`),
  ADD KEY `general_ledger_entries_account_number_fkey` (`account_number`),
  ADD KEY `general_ledger_entries_matter_id_fkey` (`matter_id`);

--
-- Indexes for table `general_ledger_journals`
--
ALTER TABLE `general_ledger_journals`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `general_ledger_journals_journal_number_key` (`journal_number`),
  ADD KEY `general_ledger_journals_created_by_user_id_fkey` (`created_by_user_id`);

--
-- Indexes for table `intakes`
--
ALTER TABLE `intakes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `intakes_intake_number_key` (`intake_number`),
  ADD KEY `intakes_practice_area_id_fkey` (`practice_area_id`),
  ADD KEY `intakes_reviewed_by_user_id_fkey` (`reviewed_by_user_id`),
  ADD KEY `intakes_converted_client_id_fkey` (`converted_client_id`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoices_invoice_number_key` (`invoice_number`),
  ADD KEY `invoices_client_id_fkey` (`client_id`),
  ADD KEY `invoices_matter_id_fkey` (`matter_id`);

--
-- Indexes for table `invoice_line_items`
--
ALTER TABLE `invoice_line_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_line_items_invoice_id_fkey` (`invoice_id`),
  ADD KEY `invoice_line_items_time_entry_id_fkey` (`time_entry_id`),
  ADD KEY `invoice_line_items_expense_id_fkey` (`expense_id`);

--
-- Indexes for table `matters`
--
ALTER TABLE `matters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `matters_matter_number_key` (`matter_number`),
  ADD KEY `idx_matters_client` (`client_id`),
  ADD KEY `idx_matters_attorney` (`responsible_attorney_id`),
  ADD KEY `matters_practice_area_id_fkey` (`practice_area_id`),
  ADD KEY `matters_current_stage_id_fkey` (`current_stage_id`);

--
-- Indexes for table `matter_staff_assignments`
--
ALTER TABLE `matter_staff_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `matter_staff_assignments_matter_id_user_id_key` (`matter_id`,`user_id`),
  ADD KEY `matter_staff_assignments_user_id_fkey` (`user_id`);

--
-- Indexes for table `matter_stage_histories`
--
ALTER TABLE `matter_stage_histories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `matter_stage_histories_matter_id_fkey` (`matter_id`),
  ADD KEY `matter_stage_histories_to_stage_id_fkey` (`to_stage_id`),
  ADD KEY `matter_stage_histories_transitioned_by_user_id_fkey` (`transitioned_by_user_id`);

--
-- Indexes for table `payment_records`
--
ALTER TABLE `payment_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payment_records_payment_reference_key` (`payment_reference`),
  ADD KEY `payment_records_invoice_id_fkey` (`invoice_id`),
  ADD KEY `payment_records_client_id_fkey` (`client_id`),
  ADD KEY `payment_records_recorded_by_user_id_fkey` (`recorded_by_user_id`);

--
-- Indexes for table `practice_areas`
--
ALTER TABLE `practice_areas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `practice_areas_code_key` (`code`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_permissions_role_id_permission_key_key` (`role_id`,`permission_key`);

--
-- Indexes for table `suggested_billing_captures`
--
ALTER TABLE `suggested_billing_captures`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `suggested_billing_captures_source_identifier_key` (`source_identifier`),
  ADD KEY `suggested_billing_captures_matter_id_fkey` (`matter_id`),
  ADD KEY `suggested_billing_captures_converted_time_entry_id_fkey` (`converted_time_entry_id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tasks_task_code_key` (`task_code`),
  ADD KEY `idx_tasks_assigned_due` (`assigned_to_user_id`,`due_date`,`status`),
  ADD KEY `tasks_matter_id_fkey` (`matter_id`),
  ADD KEY `tasks_created_by_user_id_fkey` (`created_by_user_id`);

--
-- Indexes for table `three_way_reconciliations`
--
ALTER TABLE `three_way_reconciliations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `three_way_reconciliations_reconciliation_month_key` (`reconciliation_month`),
  ADD KEY `three_way_reconciliations_audited_by_user_id_fkey` (`audited_by_user_id`);

--
-- Indexes for table `time_entries`
--
ALTER TABLE `time_entries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `time_entries_entry_code_key` (`entry_code`),
  ADD KEY `idx_time_matter_status` (`matter_id`,`status`),
  ADD KEY `idx_time_user_date` (`user_id`,`date`),
  ADD KEY `time_entries_approved_by_user_id_fkey` (`approved_by_user_id`);

--
-- Indexes for table `trust_sub_ledgers`
--
ALTER TABLE `trust_sub_ledgers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `trust_sub_ledgers_ledger_code_key` (`ledger_code`),
  ADD UNIQUE KEY `trust_sub_ledgers_matter_id_key` (`matter_id`),
  ADD KEY `trust_sub_ledgers_client_id_fkey` (`client_id`);

--
-- Indexes for table `trust_transactions`
--
ALTER TABLE `trust_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trust_transactions_trust_sub_ledger_id_fkey` (`trust_sub_ledger_id`),
  ADD KEY `trust_transactions_authorized_by_user_id_fkey` (`authorized_by_user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_user_code_key` (`user_code`),
  ADD UNIQUE KEY `users_email_key` (`email`),
  ADD KEY `users_role_fkey` (`role`);

--
-- Indexes for table `workflow_stages`
--
ALTER TABLE `workflow_stages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `workflow_stages_practice_area_id_fkey` (`practice_area_id`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `calendar_events`
--
ALTER TABLE `calendar_events`
  ADD CONSTRAINT `calendar_events_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `calendar_events_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `clients`
--
ALTER TABLE `clients`
  ADD CONSTRAINT `clients_assigned_attorney_id_fkey` FOREIGN KEY (`assigned_attorney_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `conflict_search_logs`
--
ALTER TABLE `conflict_search_logs`
  ADD CONSTRAINT `conflict_search_logs_intake_id_fkey` FOREIGN KEY (`intake_id`) REFERENCES `intakes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `conflict_search_logs_searched_by_user_id_fkey` FOREIGN KEY (`searched_by_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `documents_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `document_versions`
--
ALTER TABLE `document_versions`
  ADD CONSTRAINT `document_versions_document_id_fkey` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `document_versions_uploaded_by_user_id_fkey` FOREIGN KEY (`uploaded_by_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `expenses`
--
ALTER TABLE `expenses`
  ADD CONSTRAINT `expenses_incurred_by_user_id_fkey` FOREIGN KEY (`incurred_by_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `expenses_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `general_ledger_entries`
--
ALTER TABLE `general_ledger_entries`
  ADD CONSTRAINT `general_ledger_entries_account_number_fkey` FOREIGN KEY (`account_number`) REFERENCES `chart_of_accounts` (`account_number`) ON UPDATE CASCADE,
  ADD CONSTRAINT `general_ledger_entries_journal_id_fkey` FOREIGN KEY (`journal_id`) REFERENCES `general_ledger_journals` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `general_ledger_entries_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `general_ledger_journals`
--
ALTER TABLE `general_ledger_journals`
  ADD CONSTRAINT `general_ledger_journals_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `intakes`
--
ALTER TABLE `intakes`
  ADD CONSTRAINT `intakes_converted_client_id_fkey` FOREIGN KEY (`converted_client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `intakes_practice_area_id_fkey` FOREIGN KEY (`practice_area_id`) REFERENCES `practice_areas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `intakes_reviewed_by_user_id_fkey` FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `invoices_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `invoice_line_items`
--
ALTER TABLE `invoice_line_items`
  ADD CONSTRAINT `invoice_line_items_expense_id_fkey` FOREIGN KEY (`expense_id`) REFERENCES `expenses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `invoice_line_items_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `invoice_line_items_time_entry_id_fkey` FOREIGN KEY (`time_entry_id`) REFERENCES `time_entries` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `matters`
--
ALTER TABLE `matters`
  ADD CONSTRAINT `matters_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `matters_current_stage_id_fkey` FOREIGN KEY (`current_stage_id`) REFERENCES `workflow_stages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `matters_practice_area_id_fkey` FOREIGN KEY (`practice_area_id`) REFERENCES `practice_areas` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `matters_responsible_attorney_id_fkey` FOREIGN KEY (`responsible_attorney_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `matter_staff_assignments`
--
ALTER TABLE `matter_staff_assignments`
  ADD CONSTRAINT `matter_staff_assignments_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `matter_staff_assignments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `matter_stage_histories`
--
ALTER TABLE `matter_stage_histories`
  ADD CONSTRAINT `matter_stage_histories_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `matter_stage_histories_to_stage_id_fkey` FOREIGN KEY (`to_stage_id`) REFERENCES `workflow_stages` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `matter_stage_histories_transitioned_by_user_id_fkey` FOREIGN KEY (`transitioned_by_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `payment_records`
--
ALTER TABLE `payment_records`
  ADD CONSTRAINT `payment_records_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `payment_records_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `payment_records_recorded_by_user_id_fkey` FOREIGN KEY (`recorded_by_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `suggested_billing_captures`
--
ALTER TABLE `suggested_billing_captures`
  ADD CONSTRAINT `suggested_billing_captures_converted_time_entry_id_fkey` FOREIGN KEY (`converted_time_entry_id`) REFERENCES `time_entries` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `suggested_billing_captures_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_assigned_to_user_id_fkey` FOREIGN KEY (`assigned_to_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `tasks_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `tasks_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `three_way_reconciliations`
--
ALTER TABLE `three_way_reconciliations`
  ADD CONSTRAINT `three_way_reconciliations_audited_by_user_id_fkey` FOREIGN KEY (`audited_by_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `time_entries`
--
ALTER TABLE `time_entries`
  ADD CONSTRAINT `time_entries_approved_by_user_id_fkey` FOREIGN KEY (`approved_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `time_entries_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `time_entries_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `trust_sub_ledgers`
--
ALTER TABLE `trust_sub_ledgers`
  ADD CONSTRAINT `trust_sub_ledgers_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `trust_sub_ledgers_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `trust_transactions`
--
ALTER TABLE `trust_transactions`
  ADD CONSTRAINT `trust_transactions_authorized_by_user_id_fkey` FOREIGN KEY (`authorized_by_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `trust_transactions_trust_sub_ledger_id_fkey` FOREIGN KEY (`trust_sub_ledger_id`) REFERENCES `trust_sub_ledgers` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_role_fkey` FOREIGN KEY (`role`) REFERENCES `roles` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `workflow_stages`
--
ALTER TABLE `workflow_stages`
  ADD CONSTRAINT `workflow_stages_practice_area_id_fkey` FOREIGN KEY (`practice_area_id`) REFERENCES `practice_areas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
