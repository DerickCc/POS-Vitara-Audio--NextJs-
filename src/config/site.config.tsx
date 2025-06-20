import { Metadata } from "next";

enum MODE {
  DARK = "dark",
  LIGHT = "light",
}

export const siteConfig = {
  title: "POS Vitara Audio",
  description: `Toko Modifikasi dan Reparasi Mobil No. 1 di Medan, Indonesia. Dijamin Puas!`,
  mode: MODE.LIGHT,
  layout: 'hydrogen',
};

export const metaObject = (
  title?: string,
  description: string = siteConfig.description
): Metadata => {
  return {
    title: title ? `${title} - Vitara Audio` : siteConfig.title,
    description,
  };
};
