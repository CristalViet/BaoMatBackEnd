const prisma = require("../lib/prisma");
const asyncHandler = require("../utils/async-handler");

// Get all documents for an employee
exports.getDocuments = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;

  const documents = await prisma.employeeDocument.findMany({
    where: { employeeId },
    orderBy: { uploadedAt: "desc" },
  });

  res.json({ data: documents });
});

// Upload a document
exports.uploadDocument = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const { type, fileName, fileUrl, note } = req.body;

  if (!type || !fileName || !fileUrl) {
    return res.status(400).json({ message: "Type, fileName, and fileUrl are required" });
  }

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  const document = await prisma.employeeDocument.create({
    data: {
      employeeId,
      type,
      fileName,
      fileUrl,
      note,
    },
  });

  res.status(201).json({ message: "Document uploaded successfully", data: document });
});

// Update a document
exports.updateDocument = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const { type, fileName, fileUrl, note } = req.body;

  const document = await prisma.employeeDocument.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  const updatedDocument = await prisma.employeeDocument.update({
    where: { id: documentId },
    data: {
      type: type || document.type,
      fileName: fileName || document.fileName,
      fileUrl: fileUrl || document.fileUrl,
      note: note !== undefined ? note : document.note,
    },
  });

  res.json({ message: "Document updated successfully", data: updatedDocument });
});

// Delete a document
exports.deleteDocument = asyncHandler(async (req, res) => {
  const { documentId } = req.params;

  const document = await prisma.employeeDocument.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  await prisma.employeeDocument.delete({
    where: { id: documentId },
  });

  res.json({ message: "Document deleted successfully" });
});
