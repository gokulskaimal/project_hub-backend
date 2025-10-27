type Vars = Record<string, string>;

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const renderTemplate = (html: string, vars: Vars) => {
  let out = html;
  for (const key of Object.keys(vars)) {
    const pattern = new RegExp(escapeRegExp(`{{${key}}}`), "g");
    out = out.replace(pattern, vars[key]);
  }
  return out;
};
