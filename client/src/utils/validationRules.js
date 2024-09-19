
export const requiredField = (msg) => {
    return {
        required: true,
        message: msg,
    };
};

export const validatePassword = {
    validator: (_, value) => {
        if (value && value.length >= 6) {
            return Promise.resolve();
        }
        return Promise.reject(new Error('Password must be at least 6 characters'));
    },
};

export const validateConfirmPasssword = (getFieldValue) => ({
    validator(_, value) {
        if (!value || getFieldValue('newPassword') === value) {
            return Promise.resolve();
        }
        return Promise.reject(new Error('The two passwords that you entered do not match!'));
    },
});


export const polishPhoneValidation = {
    pattern: /^[0-9]{9}$/,
    message: 'Enter a valid Polish phone number (9 digits)',
};

export const swedishPhoneValidation = {
    pattern: /^[0-9]{9,10}$/,
    message: 'Enter a valid Swedish phone number (9-10 digits)',
};

export const universalFieldValidation = (fieldName) => ({
    pattern: /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/,
    max: 50,
    message: `Enter a valid ${fieldName} (max 50 characters)`,
});

export const validatePESEL = {
    validator: (_, value) => {
        if (!value) return Promise.resolve();

        const peselPattern = /^[0-9]{11}$/;
        if (!peselPattern.test(value)) {
            return Promise.reject(new Error('PESEL must consist of exactly 11 digits.'));
        }

        // walidatcja daty urodzenia w PESEL
        const year = parseInt(value.substring(0, 2), 10);
        const month = parseInt(value.substring(2, 4), 10) % 20;
        const day = parseInt(value.substring(4, 6), 10);

        const currentYear = new Date().getFullYear() % 100;
        const century = month > 12 ? 2000 : (year <= currentYear ? 1900 : 1800);
        const fullYear = century + year;

        const birthDate = new Date(fullYear, month - 1, day);
        if (birthDate.getFullYear() !== fullYear || birthDate.getMonth() + 1 !== month || birthDate.getDate() !== day) {
            return Promise.reject(new Error('Invalid PESEL date.'));
        }

        // checksum PESEL'u
        const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
        const sum = value.split('').reduce((acc, digit, idx) => {
            if (idx < 10) {
                acc += parseInt(digit, 10) * weights[idx];
            }
            return acc;
        }, 0);
        const checksum = (10 - (sum % 10)) % 10;

        if (checksum !== parseInt(value.charAt(10), 10)) {
            return Promise.reject(new Error('Invalid PESEL checksum.'));
        }

        return Promise.resolve();
    },
    message: 'Invalid PESEL number.',
};

export const validateNIP = {
    validator: (_, value) => {
        if (!value) return Promise.resolve();

        const nipPattern = /^[0-9]{10}$/;
        if (!nipPattern.test(value)) {
            return Promise.reject(new Error('NIP must consist of exactly 10 digits.'));
        }

        // checksum NIP'u
        const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
        const sum = value.split('').reduce((acc, digit, idx) => {
            if (idx < 9) {
                acc += parseInt(digit, 10) * weights[idx];
            }
            return acc;
        }, 0);
        const checksum = sum % 11;

        if (checksum !== parseInt(value.charAt(9), 10)) {
            return Promise.reject(new Error('Invalid NIP checksum.'));
        }

        return Promise.resolve();
    },
    message: 'Invalid NIP number.',
};

export const validateEmail = {
    validator: (_, value) => {
        if (!value) return Promise.resolve();

        const emailPattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

        if (!emailPattern.test(value)) {
            return Promise.reject(new Error('Invalid email format.'));
        }

        return Promise.resolve();
    },
    message: 'Please enter a valid email address.',
};
