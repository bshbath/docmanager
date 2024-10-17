import React from "react";
import Image from "../../atoms/Image/Image";
import styles from "./BGImage.module.css";
import LeftFileImage from "../../../assets/images/BGImageLeft.png";
import RightFileImage from "../../../assets/images/BGImageRight.png";

const BGImages = () => {
  return (
    <div className={styles.container}>
      <div className={styles.imagesContainer}>
        <div className={styles.image}>
          <Image size="bgImage" src={LeftFileImage} />
        </div>
        <div className={styles.image}>
          <Image size="bgImage" src={RightFileImage} />
        </div>
      </div>
    </div>
  );
};

export default BGImages;
