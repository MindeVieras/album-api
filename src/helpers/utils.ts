/**
 * Makes user initials from username and display name.
 *
 * @param {string} username
 *   Username.
 * @param {string} displayName
 *   Display name.
 *
 * @returns {string}
 *   User initials.
 */
export function makeInitials(username: string, displayName: string): string {
  if (!displayName || displayName.length < 2) {
    return username.slice(0, 2).toUpperCase()
  }

  const ds = displayName.split(' ')

  if (ds.length >= 2) {
    return ds[0].slice(0, 1).toUpperCase() + ds[1].slice(0, 1).toUpperCase()
  }

  if (ds.length === 1 && displayName.length >= 2) {
    return displayName.slice(0, 2).toUpperCase()
  }

  return 'N/A'
}
