const statusColor = (status: string) => {
  switch (status) {
    case "idle":
      return "#2196f3";
    case "processing":
      return "#ff9800";
    case "done":
      return "#4caf50";
    case "error":
      return "#f44336";
    default:
      return "#2196f3";
  }
};

export default statusColor;
