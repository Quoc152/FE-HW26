class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }
}

class ReadError extends Error {
    constructor(message, cause) {
        super(message);
        this.cause = cause;
        this.name = "ReadError";
    }
}

const ReadUser = async (json) => {
    try {
        const response = await fetch(json);
        if (!response.ok) {
            throw new ReadError('Failed to fetch data', response.statusText);
        }
        const users = await response.json();

        users.forEach(user => {
            try {
                validateDateOfBirth(user.dateOfBirth);
            } catch (error) {
                if (error instanceof ValidationError) {
                    throw new ValidationError(`Validation error for user ${user.name}: ${error.message}`);
                } else {
                    throw error;
                }
            }
        });

        console.log(users); // Log dữ liệu nếu không có lỗi
    } catch (error) {
        if (error instanceof ReadError) {
            throw new ReadError(error.message, error.cause);
        } else if (error instanceof ValidationError) {
            throw new ValidationError(error.message);
        } else {
            throw new Error('Unexpected error: ' + error.message);
        }
    }
}

function validateDateOfBirth(dateOfBirth) {
    // Kiểm tra dateOfBirth có đúng định dạng YYYY/MM/DD hay không
    if (!isValidDateOfBirth(dateOfBirth)) {
        throw new ValidationError('Invalid date of birth');
    }
}

function isValidDateOfBirth(dateOfBirth) {
    // Kiểm tra định dạng YYYY/MM/DD bằng regex
    const regex = /^\d{4}\/\d{2}\/\d{2}$/;
    if (!regex.test(dateOfBirth)) {
        return false;
    }

    // Kiểm tra ngày hợp lệ
    const [year, month, day] = dateOfBirth.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

(async () => {
    try {
        await ReadUser('user.json');
    } catch (e) {
        console.log('Error:', e);
        if (e instanceof ReadError) {
            console.log(`Read error occurred: ${e.message}`);
            console.log("Original error:", e.cause);
        } else if (e instanceof ValidationError) {
            console.log('Validation error occurred:', e.message);
        } else {
            console.log('Unexpected error:', e.message);
        }
    }
})();
