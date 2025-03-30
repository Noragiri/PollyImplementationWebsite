import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '', // Load from environment variables
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',     // Load from environment variables
};

if (!poolData.UserPoolId || !poolData.ClientId) {
  throw new Error('Cognito configuration is missing. Please check your environment variables.');
}

const userPool = new CognitoUserPool(poolData);

export const login = (username: string, password: string, newPassword?: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: username, Pool: userPool });
    const authDetails = new AuthenticationDetails({ Username: username, Password: password });

    user.authenticateUser(authDetails, {
      onSuccess: (result) => {
        const token = result.getIdToken().getJwtToken();
        localStorage.setItem('authToken', token); // Store token in localStorage
        resolve(token);
      },
      onFailure: (err) => {
        reject(err);
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        if (!newPassword) {
          reject(new Error('New password is required.'));
          return;
        }

        delete userAttributes.email_verified;

        user.completeNewPasswordChallenge(newPassword, {}, {
          onSuccess: (result) => {
            const token = result.getIdToken().getJwtToken();
            localStorage.setItem('authToken', token); // Store token in localStorage
            resolve(token);
          },
          onFailure: (err) => {
            reject(err);
          },
        });
      },
    });
  });
};

export const logout = () => {
  const user = userPool.getCurrentUser();
  if (user) {
    user.signOut();
  }
  localStorage.removeItem('authToken'); // Remove token from localStorage
};

export const getCurrentUser = () => {
  return userPool.getCurrentUser();
};

export const getStoredToken = () => {
  return localStorage.getItem('authToken'); // Retrieve token from localStorage
};