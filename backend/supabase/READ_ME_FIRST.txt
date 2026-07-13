DO NOT PASTE THIS FILE INTO SUPABASE

This file is only instructions. It is NOT SQL.

If you paste this into Supabase SQL Editor you will get errors on every line. That is normal because this is English text not code.


WHAT TO PASTE INSTEAD

Open these files. They end with .sql

01_tables.sql
02_security.sql
03_projects.sql
04_case_study.sql
05_site_content.sql
06_function.sql

Or use ALL_IN_ONE.sql to run everything at once.


STEPS

Go to supabase.com and open your project.

Click SQL Editor in the left menu.

Click New query.

On your computer open 01_tables.sql (NOT this READ_ME file).

Select all the text in 01_tables.sql. The first word must be create

Copy and paste into Supabase.

Click the green Run button. Do NOT use the AI chat.

If it says Success open a new query and do the same with 02_security.sql then 03 then 04 then 05 then 06.


TEST

select data from site_content where id = 'main';


CMS DASHBOARD

The backend folder is NEXT TO my-app not inside it.

From my-app folder run:
npm run backend

Or open a new terminal and run:
cd "../backend"
npm start

Then open http://localhost:5001/admin (not port 3000).

Port 3000 is the portfolio website.
Port 5001 is the CMS dashboard.

Create a user in Supabase Authentication then Users Add user with your email and password.

Sign in at /admin with your Supabase email and password.

Edits and image uploads go to Supabase and appear on the frontend after refresh.
