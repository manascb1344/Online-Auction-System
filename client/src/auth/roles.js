export const HOME_BY_ROLE = {
  buyer: "/products",
  seller: "/seller",
  admin: "/admin",
};

export function homeFor(role) {
  return HOME_BY_ROLE[role] ?? "/products";
}
