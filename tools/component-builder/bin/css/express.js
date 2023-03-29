/* Special case for express: it needs Spectrum base vars and needs to override them */
export const expressWritten = async (content) => {
  const themeIndexContent = await process(
    content,
    {
      keepUnusedVars: true,
      splinatorOptions: {
        noSelectors: true,
      },
      from: coreKey,
      to: "dist/index-theme.css",
    },
    verbose
  );

  return process(
    themeIndexContent,
    {
      keepUnusedVars: true,
      from: "dist/index-theme.css",
      to: "dist/themes/express.css",
      additionalPlugins: [
        require("../../../plugins/postcss-combininator/index.js"),
      ],
    },
    verbose
  );
};
