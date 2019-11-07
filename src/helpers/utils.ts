
export function makeInitials(username: string, display_name: string): string {
  if (!display_name || display_name.length < 2)
    return username.slice(0, 2).toUpperCase()

  let ds = display_name.split(' ')
  if (ds.length >= 2)
    return ds[0].slice(0, 1).toUpperCase() + ds[1].slice(0, 1).toUpperCase()

  if (ds.length === 1 && display_name.length >= 2)
    return display_name.slice(0, 2).toUpperCase()

  return 'N/A'
}
