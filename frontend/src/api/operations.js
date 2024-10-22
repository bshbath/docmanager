const backendAPIURL = "http://127.0.0.1:8000";

const delay = (delayInms) => {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
};

class Operations {
  constructor() {}

  async loadAllProjects() {
    try {
      const response = await fetch(`${backendAPIURL}/project/all`);
      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async loadProjectStructure(projectName) {
    try {
      const response = await fetch(`${backendAPIURL}/project/folderstructure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_name: projectName,
        }),
      });
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async loadProcessedProjects() {
    try {
      const response = await fetch(`${backendAPIURL}/project/all`);
      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async loadProjectStatus(projectName) {
    console.log("SASDFASDFDAS N ", projectName);
    try {
      const response = await fetch(`${backendAPIURL}/project/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_name: projectName,
        }),
      });
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async loadSearchStatus({ projectName, searchTerm }) {
    try {
      const response = await fetch(`${backendAPIURL}/search/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_name: projectName,
          search_term: searchTerm,
        }),
      });
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async initiateSearch(searchParams) {
    try {
      const response = await fetch(`${backendAPIURL}/search/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_name: searchParams.projectName,
          search_term: searchParams.searchTerm,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start search");
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async initiateLoad() {
    try {
      const response = await fetch(`${backendAPIURL}/api/load/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          socketId: "12345",
          query: "Hello world",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start load");
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async setupSelectedProject(projectName) {
    try {
      const response = await fetch(`${backendAPIURL}/project/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_name: projectName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start load");
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async fetchSearchResults() {
    try {
      const response = await fetch(`${backendAPIURL}/api/search/results`);
      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async fetchSearchHistoryForProject({ projectName }) {
    try {
      const response = await fetch(`${backendAPIURL}/search/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_name: projectName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start load");
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async fetchPDFFile(filePath) {
    try {
      const response = await fetch(`${backendAPIURL}/search/file`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_path: filePath,
        }),
      });

      console.log("Loaded pdf: ", response);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      if (!response.ok) {
        throw new Error("Failed to fetch load results");
      }
      return url;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async fetchLoadResults() {
    try {
      const response = await fetch(`${backendAPIURL}/api/load/results`);
      if (!response.ok) {
        throw new Error("Failed to fetch load results");
      }
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

class MockOperations {
  constructor() {}

  initiateSearch() {
    return {};
  }

  initiateLoad() {
    return {};
  }

  fetchSearchResults() {
    return {};
  }

  async fetchPDFFile(filePath) {
    return {};
  }

  fetchLoadResults() {
    return {};
  }
}
/*
export const initiateSearch = async (searchParams) => {
  try {
    const response = await fetch(`${backendAPIURL}/api/search/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: searchParams.query,
        socketId: "12345",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to start search");
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

export const initiateLoad = async () => {
  try {
    const response = await fetch(`${backendAPIURL}/api/load/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        socketId: "12345",
        query: "Hello world",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to start load");
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

export const fetchSearchResults = async () => {
  try {
    const response = await fetch(`${backendAPIURL}/api/search/results`);
    if (!response.ok) {
      throw new Error("Failed to fetch search results");
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

export const fetchLoadResults = async () => {
  try {
    const response = await fetch(`${backendAPIURL}/api/load/results`);
    if (!response.ok) {
      throw new Error("Failed to fetch load results");
    }
    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

export const fetchPDFFile = async (filePath) => {
  try {
    const response = await fetch(`${backendAPIURL}/api/pdf/load`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: filePath,
        socketId: "12345",
      }),
    });

    console.log("Loaded pdf: ", response);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    if (!response.ok) {
      throw new Error("Failed to fetch load results");
    }
    return url;
  } catch (error) {
    throw new Error(error.message);
  }
};
*/
export default new Operations();
