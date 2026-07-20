Fix the MongoDB connection and authentication completely.

Issue:
- users.findOne() buffering timed out after 10000ms
- POST /api/auth/login returns 400
- Backend is not connected to MongoDB Atlas.

Tasks:
1. Verify .env is loaded with dotenv before any database code.
2. Connect to MongoDB Atlas before app.listen().
3. Await mongoose.connect() and exit process if connection fails.
4. Log:
   ✓ MongoDB Connected
   ✓ Database Name
5. Disable Mongoose buffering:
   mongoose.set('bufferCommands', false);
6. Read MONGODB_URI only from process.env.
7. Validate MONGODB_URI exists on startup.
8. Fix auth controller to query User only after DB connection.
9. Seed default admin/user if database is empty.
10. Return proper errors:
    - 401 Invalid credentials
    - 500 Database unavailable
    - Never return raw MongoDB errors.
11. Verify bcrypt password comparison.
12. Verify JWT generation.
13. Verify AuditLog stores authenticated user's ObjectId.
14. Remove all demo/mock users.
15. Test Register → Login → Dashboard → Logout.
16. Ensure:
    - MongoDB Connected
    - No buffering timeout
    - No 400 login errors
    - No console/runtime/build errors

Generate production-ready fixes for all affected backend files.






Mongodb API Key Information
Public Key=xpfmpifq
service Account Information
Client ID
mdb_sa_id_6a5d80e8575ac46d09f118d9
Client Secret
mdb_sa_sk_us_Shgw3ivKqY98qgi4EXW94gaWC7FVXqm6m8qWE


API Keys Cloud name: clfgq62n
Manage API key and secret pairs for your product environment. To build the environment variable for each pair, copy the provided format and substitute your actual values for the placeholders. Make sure to store your secrets securely.
API environment variable
CLOUDINARY_URL=cloudinary://<your_api_key>:<your_api_secret>@clfgq62n
apikey= 926919674713172
aisecret=AoHpUPu2h4PpjtRsDYz-0pOTj54
cloudinary_cloud_name= clfgq62n