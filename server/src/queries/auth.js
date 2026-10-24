module.exports = {
  findAdminByUsername:
    "SELECT id, username, password_hash, created_at FROM admins WHERE username = :username",
  findBuyerByUsername:
    "SELECT id, username, password_hash, email, address, account_balance, created_at FROM buyers WHERE username = :username",
  findSellerByUsername:
    "SELECT id, username, password_hash, email, address, account_balance, created_at FROM sellers WHERE username = :username",

  findAdminById: "SELECT id, username, created_at FROM admins WHERE id = :id",
  findBuyerById:
    "SELECT id, username, email, address, account_balance, created_at FROM buyers WHERE id = :id",
  findSellerById:
    "SELECT id, username, email, address, account_balance, created_at FROM sellers WHERE id = :id",

  existingRoles: `
    SELECT 'buyer' AS role FROM buyers WHERE username = :username
    UNION ALL
    SELECT 'seller' AS role FROM sellers WHERE username = :username
    UNION ALL
    SELECT 'admin' AS role FROM admins WHERE username = :username
  `,

  insertBuyer: `
    INSERT INTO buyers (id, username, password_hash, email, address, account_balance, created_at)
    VALUES (:id, :username, :passwordHash, :email, :address, 0, CURRENT_TIMESTAMP)
  `,
  insertSeller: `
    INSERT INTO sellers (id, username, password_hash, email, address, account_balance, created_at)
    VALUES (:id, :username, :passwordHash, :email, :address, 0, CURRENT_TIMESTAMP)
  `,
};
