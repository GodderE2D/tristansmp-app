import Head from "next/head";

type props = {
  title: string;
  appendToTitle?: boolean;
  imageUrl?: string;
};

export const Head = ({
  title = "",
  appendToTitle = true,
  imageUrl = "",
}: props) => {
  const formattedTitle = appendToTitle ? `${title} • TristanSMP` : title;

  return (
    <Head>
      <title>{formattedTitle}</title>
      <meta property="og:title" content={formattedTitle} key="og:title" />
      <meta property="og:type" content="website" key="og:type" />
      <meta
        property="og:description"
        content="Tristan SMP is a semi-vanilla Minecraft server for both Java and Bedrock hosted in Sydney that offers an immersive and unique experience to its players."
        key="og:description"
      />
      <meta property="og:image" content={imageUrl} key="og:image" />
      <meta
        name="twitter:card"
        content="summary_large_image"
        key="twitter:card"
      />
    </Head>
  );
};
