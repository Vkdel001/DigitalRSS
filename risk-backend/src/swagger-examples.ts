// src/swagger-examples.ts
// This file contains example data and additional documentation for Swagger

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication and authorization
 *   - name: Submissions
 *     description: Customer submission management and risk assessment
 *   - name: Admin - Risk Parameters
 *     description: Manage risk scoring parameters
 *   - name: Admin - Settings
 *     description: Manage system settings and thresholds
 *   - name: Admin - Scoring Config
 *     description: Manage scoring configuration
 *   - name: Health
 *     description: API health and status endpoints
 */

/**
 * @swagger
 * components:
 *   examples:
 *     LowRiskSubmission:
 *       summary: Low risk individual submission
 *       value:
 *         type: "individual"
 *         details:
 *           - section: "personal_info"
 *             data:
 *               country: "Mauritius"
 *               isPEP: false
 *               age: 35
 *               occupation: "Engineer"
 *           - section: "financial_info"
 *             data:
 *               sourceOfWealth: "Salary"
 *               estimatedMonthlyInflow: 50000
 *     
 *     HighRiskSubmission:
 *       summary: High risk individual submission
 *       value:
 *         type: "individual"
 *         details:
 *           - section: "personal_info"
 *             data:
 *               country: "Nigeria"
 *               isPEP: true
 *               age: 45
 *               occupation: "Politician"
 *           - section: "financial_info"
 *             data:
 *               sourceOfWealth: "Business"
 *               estimatedMonthlyInflow: 200000
 *           - section: "compliance"
 *             data:
 *               blacklisted: false
 *     
 *     EntitySubmission:
 *       summary: Entity/Company submission
 *       value:
 *         type: "entity"
 *         details:
 *           - section: "company_info"
 *             data:
 *               companyName: "ABC Corp Ltd"
 *               country: "Singapore"
 *               industry: "Technology"
 *               yearEstablished: 2018
 *           - section: "financial_info"
 *             data:
 *               estimatedMonthlyTurnover: 500000
 *               sourceOfFunds: "Business Revenue"
 *           - section: "beneficial_owners"
 *             data:
 *               owners:
 *                 - name: "John Doe"
 *                   percentage: 60
 *                   isPEP: false
 *                 - name: "Jane Smith"
 *                   percentage: 40
 *                   isPEP: true
 *     
 *     CountryRiskParameter:
 *       summary: Country risk parameter
 *       value:
 *         category: "Country"
 *         parameter: "Nigeria"
 *         riskLevel: "High"
 *         scoreValue: 30
 *     
 *     PEPRiskParameter:
 *       summary: PEP risk parameter
 *       value:
 *         category: "Compliance"
 *         parameter: "PEP"
 *         riskLevel: "High"
 *         scoreValue: 25
 *     
 *     OccupationRiskParameter:
 *       summary: High-risk occupation parameter
 *       value:
 *         category: "Occupation"
 *         parameter: "Politician"
 *         riskLevel: "High"
 *         scoreValue: 20
 *     
 *     ThresholdSetting:
 *       summary: Risk threshold setting
 *       value:
 *         key: "score_threshold_high"
 *         description: "High risk threshold - submissions above this score are flagged as high risk"
 *         value: "75"
 *     
 *     NoGoCountriesSetting:
 *       summary: No-go countries setting
 *       value:
 *         key: "no_go_countries"
 *         description: "Comma-separated list of countries that automatically result in NoGo risk rating"
 *         value: "North Korea,Iran,Syria,Afghanistan"
 *     
 *     AdminUser:
 *       summary: Admin user signup
 *       value:
 *         email: "admin@company.com"
 *         password: "SecurePassword123"
 *         role: "admin"
 *     
 *     RegularUser:
 *       summary: Regular user signup
 *       value:
 *         email: "user@company.com"
 *         password: "UserPassword123"
 *         role: "user"
 *     
 *     ApproverUser:
 *       summary: Approver user signup
 *       value:
 *         email: "approver@company.com"
 *         password: "ApproverPassword123"
 *         role: "approver"
 *   
 *   responses:
 *     UnauthorizedError:
 *       description: Access token is missing or invalid
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Unauthorized"
 *     
 *     ForbiddenError:
 *       description: Insufficient permissions
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Forbidden: insufficient role"
 *     
 *     NotFoundError:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Resource not found"
 *     
 *     ValidationError:
 *       description: Input validation error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Validation failed"
 *               errors:
 *                 type: array
 *                 items:
 *                   type: string
 */