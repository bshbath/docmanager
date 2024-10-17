import React from "react";
import Image from "../../atoms/Image/Image";
import SampleImage from "../../../assets/images/SampleDoc.png";
import Text from "../../atoms/Text/Text";
import styles from "./FileCard.module.css";
import "react-tippy/dist/tippy.css";

import { Tooltip } from "react-tippy";

const FileCard = ({ onClick, file }) => {
  const { fileName, occurences } = file;
  return (
    <div onClick={() => onClick(file)} className={`${styles.container}`}>
      <div className={`${styles.image}`}>
        <Image src={SampleImage} size="docCard" />
      </div>
      <div className={`${styles.textsContainer}`}>
        <Tooltip title={fileName} position="top-start" trigger="mouseenter">
          <div className={`${styles.fileName} `}>
            <Text variant="fileName">{fileName}</Text>
          </div>
        </Tooltip>
        <div className={`${styles.pageCount}`}>
          <Text variant="pagesCountInCard">{occurences} Pages</Text>
        </div>
      </div>
    </div>
  );
};

export default FileCard;
