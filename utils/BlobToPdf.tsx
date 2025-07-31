import { Alert } from "react-native";
import RNFetchBlob from "rn-fetch-blob";

export const handleDownloadPdf = async (base64Data: any) => {
  const dirs: any = RNFetchBlob.fs.dirs;
  const path = `${dirs.DocumentDir}/sample.pdf`;

  try {
    await RNFetchBlob.fs.writeFile(path, base64Data, "base64");

    await RNFetchBlob.android.actionViewIntent(path, "application/pdf");
  } catch (error) {
    Alert.alert("Error", "Failed to save or open PDF");
    console.error(error);
  }
};
