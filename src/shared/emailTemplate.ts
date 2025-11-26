import {
  ICreateAccount,
  IPayoutConfirmation,
  IResetPassword,
} from '../types/emailTamplate';

const createAccount = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: 'Verify your account',
    html: `<body style="font-family: 'Arial', sans-serif; background-color: #f5f7fa; margin: 0; padding: 30px 0; color: #4a5568;">
    <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        <!-- Header -->
        <div style="background-color: #15B826; padding: 25px 30px; text-align: center;">
            <h1 style="color: white; font-size: 24px; margin: 0; font-weight: 600;">Verify Your Account</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 35px 40px;">
            <!-- Greeting -->
            <h2 style="color: #1a202c; font-size: 22px; margin: 0 0 25px 0; font-weight: 600;">Hi ${values.name},</h2>
            
            <!-- Message -->
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                To complete your account creation, please use the following one-time verification code:
            </p>
            
            <!-- OTP Code -->
            <div style="text-align: center; margin: 30px 0;">
                <div style="background: linear-gradient(135deg, #15B826 0%, #12a021 100%); border-radius: 10px; padding: 20px; display: inline-block; box-shadow: 0 4px 8px rgba(21, 184, 38, 0.2);">
                    <div style="font-size: 36px; font-weight: 700; letter-spacing: 10px; color: #ffffff; padding: 5px 15px; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">${values.otp}</div>
                </div>
            </div>
            
            <!-- Validity -->
            <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0; text-align: center;">
                This code is valid for <strong style="color: #15B826;">20 minutes</strong>.
            </p>
            
            <!-- Security Note -->
            <div style="background-color: #f8f9fa; border-left: 4px solid #15B826; padding: 15px 20px; border-radius: 0 6px 6px 0; margin: 30px 0;">
                <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0;">
                    <strong>Security Notice:</strong> If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.
                </p>
            </div>
            
            <!-- Footer -->
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 25px;">
                <p style="color: #718096; font-size: 14px; line-height: 1.5; margin: 0; text-align: center;">
                    Need help? Contact our <a href="#" style="color: #15B826; text-decoration: none; font-weight: 500;">support team</a>.
                </p>
            </div>
        </div>
    </div>
</body>`,
  };
  return data;
};

const resetPassword = (values: IResetPassword) => {
  const data = {
    to: values.email,
    subject: 'Reset your password',
    html: `<body style="font-family: 'Arial', sans-serif; background-color: #f5f7fa; margin: 0; padding: 30px 0; color: #4a5568;">
    <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        <!-- Header -->
        <div style="background-color: #15B826; padding: 25px 30px; text-align: center;">
            <h1 style="color: white; font-size: 24px; margin: 0; font-weight: 600;">Reset Your Password</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 35px 40px;">
            <!-- Greeting -->
            <h2 style="color: #1a202c; font-size: 22px; margin: 0 0 20px 0; font-weight: 600;">Password Reset Request</h2>
            
            <!-- Message -->
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                We received a request to reset your password. Use the verification code below to proceed:
            </p>
            
            <!-- OTP Code -->
            <div style="text-align: center; margin: 30px 0;">
                <div style="background: linear-gradient(135deg, #15B826 0%, #12a021 100%); border-radius: 10px; padding: 20px; display: inline-block; box-shadow: 0 4px 8px rgba(21, 184, 38, 0.2);">
                    <div style="font-size: 36px; font-weight: 700; letter-spacing: 10px; color: #ffffff; padding: 5px 15px; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">${values.otp}</div>
                </div>
            </div>
            
            <!-- Validity -->
            <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0; text-align: center;">
                This verification code will expire in <strong style="color: #15B826;">20 minutes</strong>.
            </p>
            
            <!-- Instructions -->
            <div style="background-color: #f0f9ff; border: 1px solid #e1f5fe; border-radius: 8px; padding: 15px 20px; margin: 25px 0;">
                <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0;">
                    <strong>Next Steps:</strong> Enter this code on the password reset page to create a new password for your account.
                </p>
            </div>
            
            <!-- Security Note -->
            <div style="background-color: #f8f9fa; border-left: 4px solid #15B826; padding: 15px 20px; border-radius: 0 6px 6px 0; margin: 30px 0;">
                <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0;">
                    <strong>Important:</strong> If you didn't request a password reset, please ignore this email. Your account remains secure.
                </p>
            </div>
            
            <!-- Footer -->
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 25px;">
                <p style="color: #718096; font-size: 14px; line-height: 1.5; margin: 0; text-align: center;">
                    Need assistance? Contact our <a href="#" style="color: #15B826; text-decoration: none; font-weight: 500;">support team</a>.
                </p>
            </div>
        </div>
    </div>
</body>`,
  };
  return data;
};

const payoutConfirmation = (values: IPayoutConfirmation) => {
  const data = {
    to: values.email,
    subject: 'Payout Confirmation - Jurnee',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0;">
  <div style="width: 100%; max-width: 600px; margin: 30px auto; background-color: #fff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">
    <!-- Header with Jurnee brand color -->
    <div style="background-color: #15B826; padding: 20px; text-align: center;">
      <h2 style="color: white; margin: 0; font-size: 24px;">Payout Confirmation</h2>
    </div>
    
    <!-- Main Content -->
    <div style="padding: 40px 30px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background-color: #15B826; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="white"/>
          </svg>
        </div>
        <h1 style="color: #333; font-size: 28px; font-weight: 600; margin-bottom: 15px;">Payout Successful!</h1>
        <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 10px;">
          Your earnings have been successfully transferred to your account.
        </p>
      </div>
      
      <div style="background-color: #f0f9f0; border-left: 4px solid #15B826; padding: 15px; margin-bottom: 30px;">
        <p style="font-size: 16px; color: #555; line-height: 1.6; margin: 0;">
          <strong style="color: #15B826;">Payment processed:</strong> $${values.amount} for 'your service'}
        </p>
      </div>
      
      <div style="margin-bottom: 30px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 16px; color: #555;">Service:</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 16px; color: #333; font-weight: 600; text-align: right;"> your service</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 16px; color: #555;">Amount:</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 16px; color: #15B826; font-weight: 700; text-align: right;">$${values.amount}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 16px; color: #555;">Status:</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 16px; color: #15B826; font-weight: 600; text-align: right;">${values.status}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; font-size: 16px; color: #555;">Transaction ID:</td>
            <td style="padding: 12px 0; font-size: 16px; color: #333; font-weight: 600; text-align: right;">${values.paypalBatchId}</td>
          </tr>
        </table>
      </div>
      
      <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 25px;">
         If you don't see the payment, please check your payment account directly or contact our support team.
      </p>
      
      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 15px; margin-top: 25px;">
        <p style="font-size: 14px; color: #666; line-height: 1.5; margin: 0;">
          <strong>Note:</strong> Thank you for providing excellent service through Jurnee. We appreciate your partnership!
        </p>
      </div>
      
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eee;">
      <p style="font-size: 14px; color: #888; margin-bottom: 10px;">
        Need help? Contact our support team at <a href="mailto:support@jurnee.com" style="color: #15B826; text-decoration: none;">support@jurnee.com</a>
      </p>
      <p style="font-size: 12px; color: #aaa; margin: 0;">
        © ${new Date().getFullYear()} Jurnee Service Provider. All rights reserved.
      </p>
    </div>
  </div>
</body>`,
  };
  return data;
};

export const emailTemplate = {
  createAccount,
  resetPassword,
  payoutConfirmation,
};
