export const extractPath = (path: string) => {
  const pathArr = path
    .split("/")
    .map((x) => x.replace(".mdx", ""))
    .slice(2);
  return `/${pathArr.join("/")}`;
};
export const formatPath = (path: string) => `content/pages${path}.mdx`;
