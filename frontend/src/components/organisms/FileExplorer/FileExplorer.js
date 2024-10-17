import React, { useState, useEffect } from "react";
import {
  Treebeard,
  animations,
  decorators as defaultDecorators,
} from "react-treebeard";
import ChevronRoundButton from "../../atoms/Button/ChevronRoundBottun";
import Button from "../../atoms/Button/Button";
import styles from "./FileExplorer.module.css";
import Image from "../../atoms/Image/Image";
import FolderImage from "../../../assets/images/Folder.png";
import PaperImage from "../../../assets/images/Paper.png";

const CustomContainer = (props) => {
  const active = props.node.active;
  const isFolder = !!props.node.children;
  return (
    <div
      onClick={props.onClick}
      className={`${props.node.children ? styles.header : styles.file} ${
        active ? (isFolder ? styles.folderSelected : styles.fileSelected) : ""
      }`}
    >
      <span>
        {props.node.children && (
          <CustomToggle style={props.style} node={props.node} />
        )}
      </span>
      <span>
        <CustomHeader node={props.node} />
      </span>
    </div>
  );
};

const CustomHeader = ({ node }) => {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span className={styles.folder}>
          {node.children ? (
            node.toggled ? (
              <Image size={"xsmall"} src={FolderImage} color="#FFCC00" />
            ) : (
              <Image size={"xsmall"} src={FolderImage} color="#9DA5AB" />
            )
          ) : (
            <Image size={"xsmall"} src={PaperImage} color="#9DA5AB" />
          )}
        </span>
        <span className={`${styles.file_name}`}>{node.name}</span>
      </div>
    </div>
  );
};

const CustomToggle = ({ node }) => (
  <div className={styles.toggle}>
    <div>
      {node.toggled ? (
        <ChevronRoundButton size={"xsmall"} chevron="down" color="#9DA5AB" />
      ) : (
        <ChevronRoundButton size={"xsmall"} chevron="right" color="#9DA5AB" />
      )}
    </div>
  </div>
);

const customTheme = {
  tree: {
    base: {
      backgroundColor: "#E4E4E4",
      color: "#333",
      padding: "10px",
      fontSize: "16px",
      borderRadius: "32px",
      maxHeight: "80vh",
      overflowY: "scroll",
    },
  },
};

const customDecorators = {
  ...defaultDecorators,
  Container: CustomContainer,
};

const customAnimations = {
  toggle: ({ node, toggled }) => ({
    animation: { rotateZ: toggled ? 90 : 0 },
    duration: 100,
  }),
  drawer: () => {
    return {
      // enter: {
      //   animation: "slideDown",
      //   duration: 100,
      // },
      leave: {
        animation: "slideUp",
        duration: 100,
      },
    };
  },
};

const FileExplorer = ({ data, itemSelected }) => {
  const [treeData, setTreeData] = useState(data);
  const [cursor, setCursor] = useState({});

  const onToggle = (node, toggled) => {
    if (cursor) {
      cursor.active = false;
    }
    node.toggled = toggled;
    node.active = true;

    setCursor(node);
    setTreeData({ ...treeData });

    itemSelected(node.id);
  };

  useEffect(() => {
    console.log("UPDATING DATA: ", data);
    setTreeData(data);
  }, [data]);

  return (
    <div className={`${styles.explorer}`}>
      <Treebeard
        style={customTheme}
        data={treeData}
        onToggle={onToggle}
        animations={customAnimations}
        decorators={customDecorators}
      />
    </div>
  );
};

export default FileExplorer;
