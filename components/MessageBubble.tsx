import React from "react";

const formatCodeBlock = (segment: string, index: number) => {
  const match = segment.match(/```(\w+)?\n([\s\S]*?)\n?```/); // Match language and code
  if (match) {
    const language = match[1] || "typescript"; // Default to 'typescript'
    const codeContent = match[2].trim();
    return (
      <pre
        key={index}
        className="bg-black p-4 rounded-md overflow-auto"
        data-language={language}
      >
        <code className={`language-${language}`}>{codeContent}</code>
      </pre>
    );
  }
  return null;
};

const formatText = (segment: string) => {
  const lines = segment.split("\n");

  return lines.map((line, index) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      // Bold headings (line starts and ends with **)
      return (
        <h2 key={index} className="text-lg font-bold mt-4 mb-2">
          {line.replace(/\*\*/g, "")}
        </h2>
      );
    } else if (line.startsWith("*")) {
      // Bulleted points
      return (
        <li key={index} className="ml-6 list-disc mt-2 text-white">
          {line.replace(/\*/g, "").trim()}
        </li>
      );
    } else {
      // Handle inline bold text and plain text
      // Replace **word** with bolded text
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, (match, p1) => {
        return `<strong class="font-bold">${p1}</strong>`;
      });

      return (
        <p
          key={index}
          className="text-gray-300 mt-2"
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    }
  });
};

const formatTable = (text: string) => {
  // 1. Extract the table portion using regex
  const tableMatch = text.match(/\|.*?\|(?:\n\|[-: ]+\|)+/);
  if (!tableMatch) return null; // Return null if no valid table found

  const table = tableMatch[0]; // Get the matched table portion

  // 2. Split the table into rows
  const rows = table.split("\n").filter((line) => /^\|.*?\|$/.test(line)); // Fixed regex here

  // 3. Extract the header row
  const headerRow = rows[0]
    ?.match(/\|([^|]*)\|/g)
    ?.map((cell) => cell.replace(/^\|+|\|+$/g, "").trim());

  // 4. Validate and skip the divider row (2nd row)
  const dividerRowValid = rows[1]?.match(/^\|[-: ]+\|$/);
  if (!dividerRowValid) return null; // Return null if no valid divider row found

  // 5. Extract and clean the body rows
  const bodyRows = rows.slice(2).map((row) =>
    row
      ?.match(/\|([^|]*)\|/g) // Extract table cells
      ?.map(
        (cell) =>
          cell
            .replace(/^\|+|\|+$/g, "") // Remove leading/trailing pipes
            .trim() // Trim whitespace
      )
  );

  // 6. Return null if header or body rows are invalid
  if (!headerRow || bodyRows.some((row) => !row)) return null;

  return (
    <table className="table-auto border-collapse border border-gray-300 mt-4">
      <thead>
        <tr>
          {headerRow.map((header, index) => (
            <th
              key={index}
              className="border border-gray-300 px-4 py-2 bg-gray-100 font-bold text-gray-800"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {bodyRows.map((row, rowIndex) =>
          row ? (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="border border-gray-300 px-4 py-2"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ) : null
        )}
      </tbody>
    </table>
  );
};

const formatAIResponse = (text: string) => {
  const segments = text.split(/(```[\s\S]*?```|\|.+\|)/g); // Split into code blocks, tables, and text
  console.log("Segments:", segments); // For debugging
  return segments.map((segment, index) => {
    if (segment.startsWith("```") && segment.endsWith("```")) {
      // Code block
      return formatCodeBlock(segment, index);
    } else if (segment.includes("|") && segment.includes("---")) {
      // Table
      const tableResult = formatTable(segment);
      console.log("Table Result:", tableResult); // For debugging
      return <div key={index}>{tableResult}</div>;
    } else {
      // Formatted text
      return <div key={index}>{formatText(segment)}</div>;
    }
  });
};

const MessageBubble = ({
  sender,
  text,
}: {
  sender: "user" | "ai";
  text: string;
}) => (
  <div className="flex">
    <div
      className={`p-2 rounded-lg m-2 mb-5  max-w-[90%] lg:max-w-[70%] ${
        sender === "user"
          ? "bg-gray-700 text-white  ml-auto"
          : "bg-gray-800 text-white self-start"
      }`}
    >
      {sender === "ai" ? (
        formatAIResponse(text)
      ) : (
        <div className="self-end inline-block">{text}</div>
      )}
    </div>
  </div>
);

export default MessageBubble;
