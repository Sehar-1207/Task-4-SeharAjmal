const Employee = require('../models/employee');

// POST /api/employees
const createEmployee = async (req, res) => {
    try {
        const { firstName, lastName, email, department, role, salary } = req.body;

        const existingEmployee = await Employee.findOne({ email });
        if (existingEmployee) {
            return res.status(400).json({ success: false, message: 'Employee with this email already exists.' });
        }

        const newEmployee = await Employee.create({
            firstName, lastName, email, department, role, salary
        });

        res.status(201).json({ success: true, data: newEmployee });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// GET /api/employees
const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).json({ success: true, count: employees.length, data: employees });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// GET /api/employees/:id
const getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        res.status(200).json({ success: true, data: employee });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

//  PUT /api/employees/:id
const updateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
            new: true,         
            runValidators: true 
        });

        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        res.status(200).json({ success: true, data: employee });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// DELETE /api/employees/:id
const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        res.status(200).json({ success: true, message: 'Employee record successfully deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

module.exports = {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
};