import React from "react";
import PropTypes from "prop-types";
import styles from "./Header.module.css";
import Image from "../../atoms/Image/Image";
import LogoImage from "../../../assets/images/LogoImage.png";
import { useNavigate } from "react-router-dom";

const Header = ({}) => {
  const navigate = useNavigate();

  return (
    <header>
      <div className={styles.header} onClick={() => navigate("/")}>
        <div className={styles.logo}>
          <Image src={LogoImage} size="logoImage" />
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {};
export default Header;
