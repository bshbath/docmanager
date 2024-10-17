// src/context/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from "react";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  // State for search progress and completion
  const [searchProgress, setSearchProgress] = useState(null);
  const [searchComplete, setSearchComplete] = useState(false);
  const [searching, setSearching] = useState(false);

  // State for load progress and completion
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadComplete, setLoadComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadedFilesCount, setLoadedFilesCount] = useState(0);
  const [folderStructure, setFolderStructure] = useState({});
  const [folderFileStructure, setFolderFileStructure] = useState({});
  const [searchResults, setSearchResults] = useState({});
  const [rootFolderId, setRootFolderId] = useState("");

  useEffect(() => {
    const socket = new WebSocket("/ws?id=12345"); // new WebSocket("ws://localhost:8000/ws?id=12345"); // WebSocket connection to FastAPI backend
    setSocket(socket);

    console.log("message received 00: ");
    socket.onmessage = (event) => {
      console.log("message received: ", event.data);
      const data = JSON.parse(event.data);

      // Handle search progress updates
      if (data.type === "search_progress") {
        setSearchProgress(data.progress);
        setSearching(true);
      }

      // Handle search completion
      if (data.type === "search_complete") {
        setSearchComplete(true);
        setSearching(false);
        console.log("FFFADFADF: ", data);
        console.log("FFFADFADF: ", data.folder_structure);
        setFolderStructure(data.folder_structure);
        setFolderFileStructure(data.folder_file_structure);
        setSearchResults(data.processed_data);
        setRootFolderId(data.root_folder_id);
      }

      // Handle load progress updates
      if (data.type === "load_progress") {
        setLoadProgress(data.progress);
        setLoading(true);
        setLoadedFilesCount(data.progress);
      }

      // Handle load completion
      if (data.type === "load_complete") {
        setLoadComplete(true);
        setLoading(false);
        setFolderStructure(data.folder_structure);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    return () => {
      // socket.close(); // Clean up WebSocket connection
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        searching,
        searchProgress,
        searchResults,
        searchComplete,
        loading,
        loadProgress,
        loadComplete,
        loadedFilesCount,
        folderStructure,
        folderFileStructure,
        rootFolderId,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
