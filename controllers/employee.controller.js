// controllers/employee.controller.js
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

if (!GOOGLE_SCRIPT_URL) {
  console.error('ERROR: GOOGLE_SCRIPT_URL is not defined in your .env file!');
 
}

// Function to add an employee to the Google Sheet via the Google Apps Script doPost
// const addEmployee = async (req, res) => {
  
//   console.log(`Admin ${req.user.userName} is attempting to add a new employee.`);

//   try {
//     const response = await fetch(GOOGLE_SCRIPT_URL, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(req.body), 
//     });

//     const result = await response.json(); 
//     if (response.ok) {
//       res.status(201).json({ message: 'Employee added successfully to Google Sheet', data: result });
//     } else {
//       // If the Google Script returns an error status, forward it
//       console.error('Error from Google Script (addEmployee):', result);
//       res.status(response.status).json({
//         error: result.error || 'Failed to add employee via Google Apps Script',
//         details: result.details || 'Check Google Apps Script logs for more info.',
//       });
//     }
//   } catch (error) {
//     console.error('Error in addEmployee controller:', error);
//     res.status(500).json({ error: 'Internal server error when adding employee.' });
//   }
// };

const addEmployee = async (req, res) => {
  console.log(`Admin ${req.user.userName} is attempting to add a new employee.`);

  try {
    const body = {
      ...req.body,
      _method: 'POST'  // ensure this is set
    };

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (response.ok) {
      res.status(201).json({ message: 'Employee added successfully to Google Sheet', data: result });
    } else {
      console.error('Error from Google Script (addEmployee):', result);
      res.status(response.status).json({
        error: result.error || 'Failed to add employee via Google Apps Script',
        details: result.details || 'Check Google Apps Script logs for more info.',
      });
    }
  } catch (error) {
    console.error('Error in addEmployee controller:', error);
    res.status(500).json({ error: 'Internal server error when adding employee.' });
  }
};



const getEmployees = async (req, res) => {
  const { name, month, page = 1, limit = 10 } = req.query;

  const queryParams = new URLSearchParams();
  if (name) queryParams.append('name', name);
  if (month) queryParams.append('month', month);
  if (page) queryParams.append('page', page);
  if (limit) queryParams.append('limit', limit);

  try {
    const finalUrl = `${GOOGLE_SCRIPT_URL}?${queryParams.toString()}`;
    console.log('Fetching:', finalUrl); // ✅ Debug

    const response = await fetch(finalUrl);
    const result = await response.json();

    if (response.ok) {
      res.status(200).json(result);
    } else {
      console.error('Google Script Error:', result);
      res.status(response.status).json({
        error: result.error || 'Failed to fetch employees',
        details: result.details || 'Check Google Apps Script logs for more info',
      });
    }
  } catch (error) {
    console.error('Backend error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const updateEmployee = async (req, res) => {
  console.log(`Admin ${req.user.userName} is updating employee: ${req.body.name}`);

  try {
    const body = {
      ...req.body,
      _method: 'PUT'
    };

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (response.ok) {
      res.status(200).json({ message: 'Employee updated successfully', data: result });
    } else {
      console.error('Google Script error (update):', result);
      res.status(response.status).json({ error: result.error || 'Failed to update employee' });
    }
  } catch (error) {
    console.error('Error in updateEmployee controller:', error);
    res.status(500).json({ error: 'Internal server error during update' });
  }
};


const deleteEmployee = async (req, res) => {
  console.log(`Admin ${req.user.userName} is deleting employee: ${req.body.name}`);

  try {
    const body = {
      name: req.body.name,
      _method: 'DELETE'
    };

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (response.ok) {
      res.status(200).json({ message: 'Employee deleted successfully', data: result });
    } else {
      console.error('Google Script error (delete):', result);
      res.status(response.status).json({ error: result.error || 'Failed to delete employee' });
    }
  } catch (error) {
    console.error('Error in deleteEmployee controller:', error);
    res.status(500).json({ error: 'Internal server error during deletion' });
  }
};


const getBirthdayCountByMonth = async (req, res) => {
  try {
    const finalUrl = `${GOOGLE_SCRIPT_URL}?_method=GET`;
    const response = await fetch(finalUrl);
    const result = await response.json();

    if (!response.ok) {
      console.error('Error from Google Script (getBirthdayCountByMonth):', result);
      return res.status(response.status).json({
        error: result.error || 'Failed to fetch data for birthday count',
      });
    }

    // Assume result.data is an array of employee records
    const employees = result.data || result;

    const monthCount = {};

    for (const emp of employees) {
      const birthdate = emp.birthdate || emp.birthDate;

      if (!birthdate) continue;

      let month;

      try {
        const dateObj = new Date(birthdate);
        if (!isNaN(dateObj)) {
          month = dateObj.getMonth(); // 0-11
        } else {
          // Try parsing manually (in case format is like DD-MM-YYYY or MM/DD/YYYY)
          const parts = birthdate.includes('-') ? birthdate.split('-') : birthdate.split('/');
          if (parts.length === 3) {
            const m = parseInt(parts[1], 10) - 1; // Adjust for 0-based month
            if (!isNaN(m)) {
              month = m;
            }
          }
        }
      } catch {
        continue; // skip if invalid
      }

      if (month !== undefined) {
        monthCount[month] = (monthCount[month] || 0) + 1;
      }
    }

    // Convert month number to month name
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const formatted = Object.entries(monthCount).map(([month, count]) => ({
      month: monthNames[parseInt(month)],
      count
    }));

    // Sort by month order
    formatted.sort((a, b) =>
      monthNames.indexOf(a.month) - monthNames.indexOf(b.month)
    );

    res.status(200).json({ data: formatted });

  } catch (error) {
    console.error('Error in getBirthdayCountByMonth:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};





const searchEmployeeByName = async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'Name query parameter is required.' });
  }

  console.log(`Admin ${req.user.userName} is searching employees by name: ${name}`);

  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?name=${encodeURIComponent(name)}`);
    const data = await response.json();

    if (response.ok) {
      res.status(200).json(data);
    } else {
      console.error('Error from Google Script (searchEmployeeByName):', data);
      res.status(response.status).json({
        error: data.error || 'Failed to search employee by name',
        details: data.details || 'Check Google Apps Script logs for more info.',
      });
    }
  } catch (error) {
    console.error('Error in searchEmployeeByName controller:', error);
    res.status(500).json({ error: 'Internal server error when searching by name.' });
  }
};

// Update employee by id
const updateEmployeeById = async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;

  // Add the _method = 'PUT' and id to the payload for your Google Apps Script
  updatedData._method = 'PUT';
  updatedData.id = id;

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST', // Google Apps Script doPost handles all methods via _method param
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });

    const result = await response.json();

    if (response.ok) {
      res.status(200).json({ message: 'Employee updated successfully', data: result });
    } else {
      res.status(response.status).json({ error: result.error || 'Failed to update employee' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error while updating employee' });
  }
};

// Delete employee by id
const deleteEmployeeById = async (req, res) => {
  const id = req.params.id;

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST', // Google Apps Script doPost handles DELETE via _method param
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _method: 'DELETE', id }),
    });

    const result = await response.json();

    if (response.ok) {
      res.status(200).json({ message: 'Employee deleted successfully', data: result });
    } else {
      res.status(response.status).json({ error: result.error || 'Failed to delete employee' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error while deleting employee' });
  }
};

const getEmployeeById = async (req, res) => {
  const id = req.params.id;

  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?id=${id}&_method=GET`);
    const data = await response.json();

    if (response.ok && data) {
      res.status(200).json(data);
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching employee data' });
  }
};


module.exports = {
  addEmployee,
  getEmployees,
  
  getEmployeeById,
  updateEmployeeById,
  deleteEmployeeById,
  getBirthdayCountByMonth
};



