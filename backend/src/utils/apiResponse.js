export const sendResponse = (res, statusCode, data, message = "Success") => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendSuccess = (res, data, message = "Success") => {
  return sendResponse(res, 200, data, message);
};

export const sendCreated = (res, data, message = "Created") => {
  return sendResponse(res, 201, data, message);
};