/**
 * ==========================================================================
 * XỬ LÝ LOGIC - HỆ THỐNG QUẢN LÝ NHÂN VIÊN FULL-TIME & PART-TIME
 * File: script.js
 * ==========================================================================
 */

// 1. Dữ liệu mẫu khởi tạo (khi chưa có dữ liệu trong LocalStorage)
const INITIAL_EMPLOYEES = [
    {
        id: "emp_1",
        code: "NV001",
        name: "Nguyễn Văn An",
        email: "an.nguyen@company.com",
        phone: "0901234567",
        department: "Kỹ thuật & CNTT",
        type: "fulltime",
        baseSalary: 18000000,
        allowance: 2500000,
        workingHours: 0,
        hourlyRate: 0
    },
    {
        id: "emp_2",
        code: "NV002",
        name: "Trần Thị Bích",
        email: "bich.tran@company.com",
        phone: "0912345678",
        department: "Marketing",
        type: "parttime",
        baseSalary: 0,
        allowance: 0,
        workingHours: 85,
        hourlyRate: 45000
    },
    {
        id: "emp_3",
        code: "NV003",
        name: "Lê Hoàng Cường",
        email: "cuong.le@company.com",
        phone: "0987654321",
        department: "Kinh doanh",
        type: "fulltime",
        baseSalary: 14000000,
        allowance: 3000000,
        workingHours: 0,
        hourlyRate: 0
    },
    {
        id: "emp_4",
        code: "NV004",
        name: "Phạm Thùy Dung",
        email: "dung.pham@company.com",
        phone: "0933445566",
        department: "Chăm sóc khách hàng",
        type: "parttime",
        baseSalary: 0,
        allowance: 0,
        workingHours: 110,
        hourlyRate: 35000
    }
];

// 2. Trạng thái ứng dụng (Application State)
let employees = [];
let currentFilter = "all"; // 'all' | 'fulltime' | 'parttime'
let searchKeyword = "";
let editingEmployeeId = null;

// 3. Truy xuất các phần tử DOM
const employeeForm = document.getElementById("employeeForm");
const formTitle = document.getElementById("formTitle");
const btnSubmit = document.getElementById("btnSubmit");
const btnReset = document.getElementById("btnReset");
const editEmployeeIdInput = document.getElementById("editEmployeeId");

// Các ô nhập liệu
const empCodeInput = document.getElementById("empCode");
const empNameInput = document.getElementById("empName");
const empEmailInput = document.getElementById("empEmail");
const empPhoneInput = document.getElementById("empPhone");
const empDepartmentInput = document.getElementById("empDepartment");

// Loại hình & trường có điều kiện
const typeRadios = document.querySelectorAll('input[name="empType"]');
const labelFullTime = document.getElementById("labelFullTime");
const labelPartTime = document.getElementById("labelPartTime");
const fullTimeFields = document.getElementById("fullTimeFields");
const partTimeFields = document.getElementById("partTimeFields");
const baseSalaryInput = document.getElementById("baseSalary");
const allowanceInput = document.getElementById("allowance");
const workingHoursInput = document.getElementById("workingHours");
const hourlyRateInput = document.getElementById("hourlyRate");

// Bảng dữ liệu & Tìm kiếm & Lọc
const employeeTableBody = document.getElementById("employeeTableBody");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const filterTabs = document.querySelectorAll(".tab-btn");

// Thống kê Dashboard
const statTotalEmployees = document.getElementById("statTotalEmployees");
const statFullTime = document.getElementById("statFullTime");
const statPartTime = document.getElementById("statPartTime");
const statTotalSalary = document.getElementById("statTotalSalary");
const countAll = document.getElementById("countAll");
const countFullTime = document.getElementById("countFullTime");
const countPartTime = document.getElementById("countPartTime");

// Toast & Đồng hồ
const toast = document.getElementById("toast");
const currentDateTime = document.getElementById("currentDateTime");

// 4. Khởi chạy ứng dụng
document.addEventListener("DOMContentLoaded", () => {
    loadEmployees();
    setupEventListeners();
    updateLiveClock();
    setInterval(updateLiveClock, 1000);
});

// 5. Lưu và Tải dữ liệu từ LocalStorage
function loadEmployees() {
    const stored = localStorage.getItem("web_qlnv_employees");
    if (stored) {
        try {
            employees = JSON.parse(stored);
        } catch (e) {
            console.error("Lỗi đọc dữ liệu localStorage:", e);
            employees = [...INITIAL_EMPLOYEES];
            saveEmployees();
        }
    } else {
        // Sử dụng dữ liệu khởi tạo mẫu
        employees = [...INITIAL_EMPLOYEES];
        saveEmployees();
    }
    renderUI();
}

function saveEmployees() {
    localStorage.setItem("web_qlnv_employees", JSON.stringify(employees));
}

// 6. Tính toán lương nhân viên theo phân loại
function calculateEmployeeSalary(emp) {
    if (emp.type === "fulltime") {
        const base = Number(emp.baseSalary) || 0;
        const allow = Number(emp.allowance) || 0;
        return base + allow;
    } else if (emp.type === "parttime") {
        const hours = Number(emp.workingHours) || 0;
        const rate = Number(emp.hourlyRate) || 0;
        return hours * rate;
    }
    return 0;
}

// Định dạng số thành tiền tệ VND
function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(amount);
}

// 7. Cập nhật Thống kê & Huy hiệu số lượng
function updateStatistics() {
    const total = employees.length;
    const fullTimeCount = employees.filter(e => e.type === "fulltime").length;
    const partTimeCount = employees.filter(e => e.type === "parttime").length;

    // Tổng quỹ lương
    const totalSalary = employees.reduce((sum, emp) => sum + calculateEmployeeSalary(emp), 0);

    // Hiển thị lên Dashboard Cards
    statTotalEmployees.textContent = total;
    statFullTime.textContent = fullTimeCount;
    statPartTime.textContent = partTimeCount;
    statTotalSalary.textContent = formatCurrency(totalSalary);

    // Cập nhật số đếm trên các nút lọc
    countAll.textContent = total;
    countFullTime.textContent = fullTimeCount;
    countPartTime.textContent = partTimeCount;
}

// 8. Kết xuất giao diện (Render Table & UI)
function renderUI() {
    updateStatistics();

    // Lọc theo loại hình
    let filteredList = employees.filter(emp => {
        if (currentFilter === "fulltime") return emp.type === "fulltime";
        if (currentFilter === "parttime") return emp.type === "parttime";
        return true;
    });

    // Lọc theo từ khóa tìm kiếm (Tên hoặc Mã nhân viên)
    if (searchKeyword.trim() !== "") {
        const keyword = searchKeyword.toLowerCase().trim();
        filteredList = filteredList.filter(emp =>
            emp.name.toLowerCase().includes(keyword) ||
            emp.code.toLowerCase().includes(keyword) ||
            emp.email.toLowerCase().includes(keyword)
        );
    }

    // Hiển thị bảng
    employeeTableBody.innerHTML = "";

    if (filteredList.length === 0) {
        emptyState.classList.remove("hidden");
    } else {
        emptyState.classList.add("hidden");

        filteredList.forEach((emp, index) => {
            const tr = document.createElement("tr");
            const salary = calculateEmployeeSalary(emp);

            // Xây dựng chi tiết lương hiển thị
            let detailHtml = "";
            let badgeHtml = "";

            if (emp.type === "fulltime") {
                badgeHtml = `<span class="badge badge-fulltime"><i class="fa-solid fa-briefcase"></i> Full-time</span>`;
                detailHtml = `
                    <div class="salary-breakdown">
                        <div>Lương CB: <strong>${formatCurrency(emp.baseSalary)}</strong></div>
                        <div>Phụ cấp: +${formatCurrency(emp.allowance)}</div>
                    </div>
                `;
            } else {
                badgeHtml = `<span class="badge badge-parttime"><i class="fa-solid fa-clock"></i> Part-time</span>`;
                detailHtml = `
                    <div class="salary-breakdown">
                        <div>Số giờ: <strong>${emp.workingHours} giờ</strong></div>
                        <div>Đơn giá: ${formatCurrency(emp.hourlyRate)}/giờ</div>
                    </div>
                `;
            }

            tr.innerHTML = `
                <td><strong>${index + 1}</strong></td>
                <td><span class="badge" style="background:#f1f5f9; color:#334155;">${emp.code}</span></td>
                <td>
                    <div class="emp-info">
                        <span class="emp-name">${emp.name}</span>
                        <span class="emp-sub"><i class="fa-regular fa-envelope"></i> ${emp.email} | <i class="fa-solid fa-phone"></i> ${emp.phone}</span>
                    </div>
                </td>
                <td>${emp.department}</td>
                <td>${badgeHtml}</td>
                <td>${detailHtml}</td>
                <td><span class="salary-total">${formatCurrency(salary)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" title="Chỉnh sửa" onclick="handleEdit('${emp.id}')">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-action btn-delete" title="Xóa nhân viên" onclick="handleDelete('${emp.id}')">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            `;

            employeeTableBody.appendChild(tr);
        });
    }
}

// 9. Chuyển đổi qua lại giữa hình thức Full-time & Part-time
function switchEmployeeType(type) {
    if (type === "fulltime") {
        labelFullTime.classList.add("active");
        labelPartTime.classList.remove("active");
        fullTimeFields.classList.remove("hidden");
        partTimeFields.classList.add("hidden");

        baseSalaryInput.required = true;
        workingHoursInput.required = false;
        hourlyRateInput.required = false;
    } else {
        labelPartTime.classList.add("active");
        labelFullTime.classList.remove("active");
        fullTimeFields.classList.add("hidden");
        partTimeFields.classList.remove("hidden");

        baseSalaryInput.required = false;
        workingHoursInput.required = true;
        hourlyRateInput.required = true;
    }
}

// 10. Xử lý Thêm / Cập nhật nhân viên
function handleFormSubmit(e) {
    e.preventDefault();

    const code = empCodeInput.value.trim().toUpperCase();
    const name = empNameInput.value.trim();
    const email = empEmailInput.value.trim();
    const phone = empPhoneInput.value.trim();
    const department = empDepartmentInput.value;
    const selectedType = document.querySelector('input[name="empType"]:checked').value;

    // Kiểm tra trùng mã nhân viên
    const isCodeDuplicate = employees.some(emp =>
        emp.code.toUpperCase() === code && emp.id !== editingEmployeeId
    );
    if (isCodeDuplicate) {
        showToast(`Mã nhân viên "${code}" đã tồn tại trên hệ thống!`, "error");
        empCodeInput.focus();
        return;
    }

    // Đọc số liệu riêng theo loại
    let baseSalary = 0;
    let allowance = 0;
    let workingHours = 0;
    let hourlyRate = 0;

    if (selectedType === "fulltime") {
        baseSalary = Number(baseSalaryInput.value) || 0;
        allowance = Number(allowanceInput.value) || 0;

        if (baseSalary <= 0) {
            showToast("Vui lòng nhập lương cơ bản lớn hơn 0!", "error");
            baseSalaryInput.focus();
            return;
        }
    } else {
        workingHours = Number(workingHoursInput.value) || 0;
        hourlyRate = Number(hourlyRateInput.value) || 0;

        if (workingHours <= 0 || hourlyRate <= 0) {
            showToast("Vui lòng nhập số giờ làm và đơn giá giờ hợp lệ (> 0)!", "error");
            return;
        }
    }

    if (editingEmployeeId) {
        // Cập nhật nhân viên đang chọn
        const index = employees.findIndex(emp => emp.id === editingEmployeeId);
        if (index !== -1) {
            employees[index] = {
                ...employees[index],
                code,
                name,
                email,
                phone,
                department,
                type: selectedType,
                baseSalary,
                allowance,
                workingHours,
                hourlyRate
            };
            showToast(`Đã cập nhật thông tin nhân viên ${name}!`, "success");
        }
    } else {
        // Thêm nhân viên mới
        const newEmployee = {
            id: "emp_" + Date.now(),
            code,
            name,
            email,
            phone,
            department,
            type: selectedType,
            baseSalary,
            allowance,
            workingHours,
            hourlyRate
        };
        employees.unshift(newEmployee);
        showToast(`Thêm nhân viên ${name} thành công!`, "success");
    }

    // Lưu dữ liệu & cập nhật bảng
    saveEmployees();
    renderUI();
    resetForm();
}

// 11. Bắt đầu chỉnh sửa nhân viên
window.handleEdit = function(id) {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;

    editingEmployeeId = emp.id;
    editEmployeeIdInput.value = emp.id;

    // Đổ dữ liệu vào form
    empCodeInput.value = emp.code;
    empNameInput.value = emp.name;
    empEmailInput.value = emp.email;
    empPhoneInput.value = emp.phone;
    empDepartmentInput.value = emp.department;

    // Chọn đúng loại hình
    const radio = document.querySelector(`input[name="empType"][value="${emp.type}"]`);
    if (radio) {
        radio.checked = true;
        switchEmployeeType(emp.type);
    }

    if (emp.type === "fulltime") {
        baseSalaryInput.value = emp.baseSalary;
        allowanceInput.value = emp.allowance;
    } else {
        workingHoursInput.value = emp.workingHours;
        hourlyRateInput.value = emp.hourlyRate;
    }

    // Cập nhật giao diện nút bấm form
    formTitle.innerHTML = `<i class="fa-solid fa-user-pen"></i> Chỉnh Sửa Nhân Viên: ${emp.code}`;
    btnSubmit.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Lưu thay đổi`;
    btnSubmit.classList.add("btn-primary");

    // Cuộn màn hình nhẹ nhàng đến form
    employeeForm.scrollIntoView({ behavior: "smooth", block: "start" });
};

// 12. Xóa nhân viên
window.handleDelete = function(id) {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;

    const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa nhân viên "${emp.name} (${emp.code})"?`);
    if (!confirmDelete) return;

    employees = employees.filter(e => e.id !== id);
    saveEmployees();

    // Nếu đang sửa nhân viên này mà bị xóa thì reset form
    if (editingEmployeeId === id) {
        resetForm();
    }

    renderUI();
    showToast(`Đã xóa nhân viên ${emp.name}!`, "info");
};

// 13. Làm mới form về trạng thái ban đầu
function resetForm() {
    editingEmployeeId = null;
    editEmployeeIdInput.value = "";
    employeeForm.reset();

    // Mặc định chọn Full-time
    const defaultRadio = document.querySelector('input[name="empType"][value="fulltime"]');
    if (defaultRadio) {
        defaultRadio.checked = true;
    }
    switchEmployeeType("fulltime");

    // Đổi lại tiêu đề và nút bấm
    formTitle.innerHTML = `<i class="fa-solid fa-user-plus"></i> Thêm Nhân Viên Mới`;
    btnSubmit.innerHTML = `<i class="fa-solid fa-plus"></i> Thêm nhân viên`;
}

// 14. Hiển thị thông báo Toast
function showToast(message, type = "info") {
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.className = "toast";
    }, 3200);
}

// 15. Đồng hồ thời gian thực
function updateLiveClock() {
    const now = new Date();
    const options = {
        weekday: "long",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    };
    currentDateTime.innerHTML = `<i class="fa-regular fa-calendar-days"></i> ${now.toLocaleDateString("vi-VN", options)}`;
}

// 16. Thiết lập các sự kiện lắng nghe (Event Listeners)
function setupEventListeners() {
    // Submit form
    employeeForm.addEventListener("submit", handleFormSubmit);

    // Nút làm mới form
    btnReset.addEventListener("click", resetForm);

    // Chuyển đổi loại hình nhân viên
    typeRadios.forEach(radio => {
        radio.addEventListener("change", (e) => {
            switchEmployeeType(e.target.value);
        });
    });

    // Lọc theo Tab (Tất cả, Full-time, Part-time)
    filterTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            filterTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            currentFilter = tab.getAttribute("data-filter");
            renderUI();
        });
    });

    // Tìm kiếm thời gian thực
    searchInput.addEventListener("input", (e) => {
        searchKeyword = e.target.value;
        renderUI();
    });
}
