// Dữ liệu mẫu cho từng bảng - Passwords đã được hash bằng bcrypt
const users = [
    { username: 'admin', email: 'admin@datxevn.vn', password: '$2b$10$NFmX6hFYu5hnBCmE3lg12eI7cus5qb.52U3LDkyey81S3aEKCoUvu', role: 'admin', phone: '0909000001', is_active: true },
    { username: 'nguyenvana', email: 'nguyenvana@gmail.com', password: '$2b$10$peT7WhVowLKQR.Eq4QXt6OkmlLO4pAXikZe6nYJwp7T5H2abvmbPe', role: 'user', phone: '0965123456', is_active: true },
    { username: 'lethib', email: 'lethib@gmail.com', password: '$2b$10$TFFeMXcp8vx/um8AlTuWU.d4ouxIFJQ1dO8PztnvRqBBdX0pjJHR6', role: 'user', phone: '0934467890', is_active: true },
    { username: 'tranthic', email: 'tranthic@gmail.com', password: '$2b$10$q/8CtszBak7hie1yA6TDte852dr9o1AM1V9zH0rOtZ8Ex2elurN..', role: 'user', phone: '0987654321', is_active: true },
    { username: 'phamvand', email: 'phamvand@gmail.com', password: '$2b$10$29KdvzCf8VvnLdZbqzMQk.TL/5CGRuXVFWUaOrRiuTnNR3p16ls4C', role: 'user', phone: '0912345678', is_active: true },
    { username: 'hoangthie', email: 'hoangthie@gmail.com', password: '$2b$10$EHmCHZkaSNDdV7lL3awHxO2rudI74nf7dT03yag18G8Mda61.wWhC', role: 'user', phone: '0923456789', is_active: true },
    { username: 'vumanager', email: 'manager@datxevn.vn', password: '$2b$10$eSw1chMysvGh9IObj9dpvuV5tlFVF4kqzonN35QiNBDlVosJ7cByi', role: 'admin', phone: '0908000002', is_active: true },
    { username: 'driver1', email: 'driver1@datxevn.vn', password: '$2b$10$LKYvPGO/Uowk2MjuNNFG9.gQ5R97aN7z7cc2dH.tlomnqFY9YFK3K', role: 'user', phone: '0908000003', is_active: true },
    { username: 'driver2', email: 'driver2@datxevn.vn', password: '$2b$10$xjiLH/6xjoMm3sK/xJyjrOtVDBGkmh7Tl6Y9HH7.onnDWy57l9ITG', role: 'user', phone: '0908000004', is_active: true },
    { username: 'staff1', email: 'staff1@datxevn.vn', password: '$2b$10$CvNaQOAJHv82b8pBNnCAz.ylMpi.DGKUw.6Q5XNSMOBa6qMLkQlvi', role: 'admin', phone: '0908000005', is_active: true },
];

const busCompanies = [
    {
        company_name: 'Xe Khách Phương Trang',
        descriptions: 'Nhà xe lớn tại Việt Nam, nổi tiếng với tuyến Sài Gòn ⇄ Cần Thơ.',
        image: '/uploads/futa-bus.png',
        logo_url: '/uploads/futa-logo.png',
        contact_phone: '19006067',
        contact_email: 'contact@phuongtrang.vn',
        address: '272 Đinh Bộ Lĩnh, Q. Bình Thạnh, TP.HCM',
        is_active: true
    },
    {
        company_name: 'Xe Khách Mai Linh',
        descriptions: 'Chuyên tuyến Sài Gòn - Vũng Tàu, xe giường nằm êm ái.',
        image: '/uploads/mailinh-bus.png',
        logo_url: '/uploads/mailinh-logo.png',
        contact_phone: '19006061',
        contact_email: 'info@mailinh.vn',
        address: '12 Nguyễn Thái Học, Q.1, TP.HCM',
        is_active: true
    },
    {
        company_name: 'Xe Khách Hoàng Long',
        descriptions: 'Nhà xe uy tín chuyên tuyến miền Bắc, xe giường nằm cao cấp.',
        image: '/uploads/hoanglong-bus.png',
        logo_url: '/uploads/hoanglong-logo.png',
        contact_phone: '19006062',
        contact_email: 'info@hoanglong.vn',
        address: '123 Nguyễn Văn Cừ, Q.5, TP.HCM',
        is_active: true
    },
    {
        company_name: 'Xe Khách Thành Bưởi',
        descriptions: 'Chuyên tuyến miền Tây, xe giường nằm tiện nghi.',
        image: '/uploads/thanhbuoi-bus.png',
        logo_url: '/uploads/thanhbuoi-logo.png',
        contact_phone: '19006063',
        contact_email: 'contact@thanhbuoi.vn',
        address: '456 Lê Hồng Phong, Q.10, TP.HCM',
        is_active: true
    },
    {
        company_name: 'Xe Khách Kumho',
        descriptions: 'Nhà xe Hàn Quốc, xe giường nằm cao cấp, dịch vụ 5 sao.',
        image: '/uploads/kumho-bus.png',
        logo_url: '/uploads/kumho-logo.png',
        contact_phone: '19006064',
        contact_email: 'info@kumho.vn',
        address: '789 Cách Mạng Tháng 8, Q.10, TP.HCM',
        is_active: true
    },
];

const stations = [
    {
        name: 'Bến xe Miền Tây',
        image: '/uploads/mien-tay.jpg',
        wallpaper: '/uploads/mien-tay-wall.jpg',
        descriptions: 'Bến xe lớn phía Nam chuyên tuyến miền Tây',
        location: '395 Kinh Dương Vương, Q. Bình Tân, TP.HCM',
        city: 'TP.HCM',
        province: 'TP.HCM',
        is_active: true
    },
    {
        name: 'Bến xe Cần Thơ',
        image: '/uploads/can-tho.jpg',
        wallpaper: '/uploads/can-tho-wall.jpg',
        descriptions: 'Bến xe trung tâm thành phố Cần Thơ',
        location: 'Số 91B, Q. Ninh Kiều, TP. Cần Thơ',
        city: 'Cần Thơ',
        province: 'Cần Thơ',
        is_active: true
    },
    {
        name: 'Bến xe Vũng Tàu',
        image: '/uploads/vung-tau.jpg',
        wallpaper: '/uploads/vung-tau-wall.jpg',
        descriptions: 'Bến xe trung tâm thành phố biển Vũng Tàu',
        location: '192 Nam Kỳ Khởi Nghĩa, TP. Vũng Tàu',
        city: 'Vũng Tàu',
        province: 'Bà Rịa - Vũng Tàu',
        is_active: true
    },
    {
        name: 'Bến xe Miền Đông',
        image: '/uploads/mien-dong.jpg',
        wallpaper: '/uploads/mien-dong-wall.jpg',
        descriptions: 'Bến xe lớn phía Đông chuyên tuyến miền Đông Nam Bộ',
        location: '292 Đinh Bộ Lĩnh, Q. Bình Thạnh, TP.HCM',
        city: 'TP.HCM',
        province: 'TP.HCM',
        is_active: true
    },
    {
        name: 'Bến xe An Sương',
        image: '/uploads/an-suong.jpg',
        wallpaper: '/uploads/an-suong-wall.jpg',
        descriptions: 'Bến xe phía Tây Bắc TP.HCM',
        location: 'QL22, H. Hóc Môn, TP.HCM',
        city: 'TP.HCM',
        province: 'TP.HCM',
        is_active: true
    },
    {
        name: 'Bến xe Đà Nẵng',
        image: '/uploads/da-nang.jpg',
        wallpaper: '/uploads/da-nang-wall.jpg',
        descriptions: 'Bến xe trung tâm thành phố Đà Nẵng',
        location: 'Tôn Đức Thắng, Q. Liên Chiểu, TP. Đà Nẵng',
        city: 'Đà Nẵng',
        province: 'Đà Nẵng',
        is_active: true
    },
    {
        name: 'Bến xe Hà Nội',
        image: '/uploads/ha-noi.jpg',
        wallpaper: '/uploads/ha-noi-wall.jpg',
        descriptions: 'Bến xe lớn nhất miền Bắc',
        location: 'Nguyễn Khoái, Q. Hai Bà Trưng, TP. Hà Nội',
        city: 'Hà Nội',
        province: 'Hà Nội',
        is_active: true
    },
    {
        name: 'Bến xe Nha Trang',
        image: '/uploads/nha-trang.jpg',
        wallpaper: '/uploads/nha-trang-wall.jpg',
        descriptions: 'Bến xe thành phố biển Nha Trang',
        location: 'Vĩnh Điềm Trung, TP. Nha Trang, Khánh Hòa',
        city: 'Nha Trang',
        province: 'Khánh Hòa',
        is_active: true
    },
];

const routes = [
    {
        departure_station_id: 1,
        arrival_station_id: 2,
        distance_km: 170.5,
        estimated_duration_hours: 3.5,

        is_active: true
    },
    {
        departure_station_id: 1,
        arrival_station_id: 3,
        distance_km: 90.0,
        estimated_duration_hours: 2.0,

        is_active: true
    },
    {
        departure_station_id: 1,
        arrival_station_id: 4,
        distance_km: 15.0,
        estimated_duration_hours: 0.5,

        is_active: true
    },
    {
        departure_station_id: 1,
        arrival_station_id: 5,
        distance_km: 25.0,
        estimated_duration_hours: 1.0,

        is_active: true
    },
    {
        departure_station_id: 1,
        arrival_station_id: 6,
        distance_km: 750.0,
        estimated_duration_hours: 12.0,

        is_active: true
    },
    {
        departure_station_id: 1,
        arrival_station_id: 7,
        distance_km: 1200.0,
        estimated_duration_hours: 20.0,

        is_active: true
    },
    {
        departure_station_id: 1,
        arrival_station_id: 8,
        distance_km: 400.0,
        estimated_duration_hours: 8.0,

        is_active: true
    },
    {
        departure_station_id: 2,
        arrival_station_id: 3,
        distance_km: 200.0,
        estimated_duration_hours: 4.0,

        is_active: true
    },
    {
        departure_station_id: 6,
        arrival_station_id: 7,
        distance_km: 600.0,
        estimated_duration_hours: 10.0,

        is_active: true
    },
    {
        departure_station_id: 6,
        arrival_station_id: 8,
        distance_km: 200.0,
        estimated_duration_hours: 4.0,

        is_active: true
    }
];

const cars = [
    {
        name: 'Futa Limousine',
        description: 'Xe Limousine cao cấp, 9 chỗ',
        license_plate: '51B-88888',
        capacity: 9,
        company_id: 1,
        featured_image: '/uploads/futa-limousine.jpg'
    },
    {
        name: 'Mai Linh Express',
        description: 'Xe giường nằm, phục vụ nước miễn phí',
        license_plate: '72B-66666',
        capacity: 40,
        company_id: 2,
        featured_image: '/uploads/mailinh-express.jpg'
    },
    {
        name: 'Hoàng Long VIP',
        description: 'Xe giường nằm VIP, 32 chỗ, điều hòa 2 tầng',
        license_plate: '29B-12345',
        capacity: 32,
        company_id: 3,
        featured_image: '/uploads/hoanglong-vip.jpg'
    },
    {
        name: 'Thành Bưởi Standard',
        description: 'Xe giường nằm tiêu chuẩn, 40 chỗ',
        license_plate: '30B-54321',
        capacity: 40,
        company_id: 4,
        featured_image: '/uploads/thanhbuoi-standard.jpg'
    },
    {
        name: 'Kumho Luxury',
        description: 'Xe giường nằm cao cấp, 28 chỗ, dịch vụ 5 sao',
        license_plate: '43B-98765',
        capacity: 28,
        company_id: 5,
        featured_image: '/uploads/kumho-luxury.jpg'
    },
    {
        name: 'Futa Standard',
        description: 'Xe giường nằm tiêu chuẩn, 45 chỗ',
        license_plate: '51B-11111',
        capacity: 45,
        company_id: 1,
        featured_image: '/uploads/futa-standard.jpg'
    },
    {
        name: 'Mai Linh VIP',
        description: 'Xe giường nằm VIP, 35 chỗ, có wifi',
        license_plate: '72B-22222',
        capacity: 35,
        company_id: 2,
        featured_image: '/uploads/mailinh-vip.jpg'
    },
    {
        name: 'Hoàng Long Standard',
        description: 'Xe giường nằm tiêu chuẩn, 42 chỗ',
        license_plate: '29B-33333',
        capacity: 42,
        company_id: 3,
        featured_image: '/uploads/hoanglong-standard.jpg'
    },
    {
        name: 'Thành Bưởi VIP',
        description: 'Xe giường nằm VIP, 30 chỗ, có TV',
        license_plate: '30B-44444',
        capacity: 30,
        company_id: 4,
        featured_image: '/uploads/thanhbuoi-vip.jpg'
    },
    {
        name: 'Kumho Standard',
        description: 'Xe giường nằm tiêu chuẩn, 38 chỗ',
        license_plate: '43B-55555',
        capacity: 38,
        company_id: 5,
        featured_image: '/uploads/kumho-standard.jpg'
    },
];

const schedules = [
    {
        route_id: 1,
        bus_id: 1,
        departure_time: '2025-01-15 08:00:00',
        is_active: true
    },
    {
        route_id: 1,
        bus_id: 6,
        departure_time: '2025-01-15 14:00:00',
        is_active: true
    },
    {
        route_id: 2,
        bus_id: 2,
        departure_time: '2025-01-15 09:00:00',
        is_active: true
    },
    {
        route_id: 2,
        bus_id: 7,
        departure_time: '2025-01-15 15:00:00',
        is_active: true
    },
    {
        route_id: 3,
        bus_id: 1,
        departure_time: '2025-01-15 10:00:00',
        is_active: true
    },
    {
        route_id: 4,
        bus_id: 2,
        departure_time: '2025-01-15 11:00:00',
        is_active: true
    },
    {
        route_id: 5,
        bus_id: 3,
        departure_time: '2025-01-15 20:00:00',
        is_active: true
    },
    {
        route_id: 5,
        bus_id: 8,
        departure_time: '2025-01-16 08:00:00',
        is_active: true
    },
    {
        route_id: 6,
        bus_id: 4,
        departure_time: '2025-01-15 18:00:00',
        is_active: true
    },
    {
        route_id: 6,
        bus_id: 9,
        departure_time: '2025-01-16 06:00:00',
        is_active: true
    },
    {
        route_id: 7,
        bus_id: 5,
        departure_time: '2025-01-15 22:00:00',
        is_active: true
    },
    {
        route_id: 7,
        bus_id: 10,
        departure_time: '2025-01-16 10:00:00',
        is_active: true
    },
    {
        route_id: 8,
        bus_id: 3,
        departure_time: '2025-01-15 12:00:00',
        is_active: true
    },
    {
        route_id: 9,
        bus_id: 4,
        departure_time: '2025-01-15 19:00:00',
        is_active: true
    },
    {
        route_id: 10,
        bus_id: 5,
        departure_time: '2025-01-15 21:00:00',
        is_active: true
    },
];

const seats = [
    // Futa Limousine (9 chỗ) - bus_id references cars table
    ...Array.from({ length: 9 }).map((_, idx) => ({
        bus_id: 1,
        seat_number: `A${idx + 1}`,
        seat_type: idx < 3 ? 'LUXURY' : idx < 6 ? 'VIP' : 'STANDARD',
        status: 'AVAILABLE',
        price_for_type_seat: 200000
    })),
    // Mai Linh Express (40 chỗ) - bus_id references cars table
    ...Array.from({ length: 40 }).map((_, idx) => ({
        bus_id: 2,
        seat_number: `${idx + 1}`,
        seat_type: idx < 4 ? 'LUXURY' : idx < 20 ? 'VIP' : 'STANDARD',
        status: 'AVAILABLE',
        price_for_type_seat: idx < 4 ? 180000 : idx < 20 ? 150000 : 100000
    })),
    // Hoàng Long VIP (32 chỗ)
    ...Array.from({ length: 32 }).map((_, idx) => ({
        bus_id: 3,
        seat_number: `${idx + 1}`,
        seat_type: idx < 6 ? 'LUXURY' : idx < 16 ? 'VIP' : 'STANDARD',
        status: 'AVAILABLE',
        price_for_type_seat: idx < 6 ? 220000 : idx < 16 ? 180000 : 120000
    })),
    // Thành Bưởi Standard (40 chỗ)
    ...Array.from({ length: 40 }).map((_, idx) => ({
        bus_id: 4,
        seat_number: `${idx + 1}`,
        seat_type: idx < 4 ? 'LUXURY' : idx < 20 ? 'VIP' : 'STANDARD',
        status: 'AVAILABLE',
        price_for_type_seat: idx < 4 ? 160000 : idx < 20 ? 130000 : 90000
    })),
    // Kumho Luxury (28 chỗ)
    ...Array.from({ length: 28 }).map((_, idx) => ({
        bus_id: 5,
        seat_number: `${idx + 1}`,
        seat_type: idx < 8 ? 'LUXURY' : idx < 18 ? 'VIP' : 'STANDARD',
        status: 'AVAILABLE',
        price_for_type_seat: idx < 8 ? 250000 : idx < 18 ? 200000 : 150000
    })),
    // Futa Standard (45 chỗ)
    ...Array.from({ length: 45 }).map((_, idx) => ({
        bus_id: 6,
        seat_number: `${idx + 1}`,
        seat_type: idx < 5 ? 'LUXURY' : idx < 25 ? 'VIP' : 'STANDARD',
        status: 'AVAILABLE',
        price_for_type_seat: idx < 5 ? 170000 : idx < 25 ? 140000 : 95000
    })),
    // Mai Linh VIP (35 chỗ)
    ...Array.from({ length: 35 }).map((_, idx) => ({
        bus_id: 7,
        seat_number: `${idx + 1}`,
        seat_type: idx < 7 ? 'LUXURY' : idx < 20 ? 'VIP' : 'STANDARD',
        status: 'AVAILABLE',
        price_for_type_seat: idx < 7 ? 190000 : idx < 20 ? 160000 : 110000
    })),
    // Hoàng Long Standard (42 chỗ)
    ...Array.from({ length: 42 }).map((_, idx) => ({
        bus_id: 8,
        seat_number: `${idx + 1}`,
        seat_type: idx < 4 ? 'LUXURY' : idx < 22 ? 'VIP' : 'STANDARD',
        status: 'AVAILABLE',
        price_for_type_seat: idx < 4 ? 180000 : idx < 22 ? 150000 : 100000
    })),
    // Thành Bưởi VIP (30 chỗ)
    ...Array.from({ length: 30 }).map((_, idx) => ({
        bus_id: 9,
        seat_number: `${idx + 1}`,
        seat_type: idx < 6 ? 'LUXURY' : idx < 18 ? 'VIP' : 'STANDARD',
        status: 'AVAILABLE',
        price_for_type_seat: idx < 6 ? 200000 : idx < 18 ? 170000 : 120000
    })),
    // Kumho Standard (38 chỗ)
    ...Array.from({ length: 38 }).map((_, idx) => ({
        bus_id: 10,
        seat_number: `${idx + 1}`,
        seat_type: idx < 5 ? 'LUXURY' : idx < 20 ? 'VIP' : 'STANDARD',
        status: 'AVAILABLE',
        price_for_type_seat: idx < 5 ? 190000 : idx < 20 ? 160000 : 110000
    })),
];

// Payment Providers Việt Nam
const paymentProviders = [
    { provider_name: 'VNPAY', provider_type: 'E_WALLET', api_endpoint: 'https://sandbox.vnpay.vn/', is_active: true },
    { provider_name: 'MoMo', provider_type: 'E_WALLET', api_endpoint: 'https://test-payment.momo.vn/', is_active: true },
    { provider_name: 'Ngân hàng Vietcombank', provider_type: 'BANK_TRANSFER', api_endpoint: 'https://vcb.vietnam/', is_active: true },
    { provider_name: 'ZaloPay', provider_type: 'E_WALLET', api_endpoint: 'https://sbgateway.zalopay.vn/', is_active: true },
    { provider_name: 'Ngân hàng BIDV', provider_type: 'BANK_TRANSFER', api_endpoint: 'https://bidv.vn/', is_active: true },
    { provider_name: 'Ngân hàng Techcombank', provider_type: 'BANK_TRANSFER', api_endpoint: 'https://techcombank.com.vn/', is_active: true },
    { provider_name: 'AirPay', provider_type: 'E_WALLET', api_endpoint: 'https://airpay.vn/', is_active: true },
    { provider_name: 'Ngân hàng Agribank', provider_type: 'BANK_TRANSFER', api_endpoint: 'https://agribank.com.vn/', is_active: true }
];

// Tickets - book chỗ đang available (dùng seat, schedule, user đã seed ở trên), trạng thái "BOOKED"
const tickets = [
    { user_id: 2, schedule_id: 1, seat_id: 1, status: 'BOOKED', total_price: 200000, reason: null },
    { user_id: 3, schedule_id: 2, seat_id: 10, status: 'BOOKED', total_price: 150000, reason: null },
    { user_id: 4, schedule_id: 3, seat_id: 50, status: 'BOOKED', total_price: 200000, reason: null },
    { user_id: 5, schedule_id: 4, seat_id: 80, status: 'BOOKED', total_price: 150000, reason: null },
    { user_id: 6, schedule_id: 5, seat_id: 120, status: 'BOOKED', total_price: 250000, reason: null },
    { user_id: 2, schedule_id: 1, seat_id: 2, status: 'CANCELED', total_price: 200000, reason: 'Khách tự hủy' },
    { user_id: 3, schedule_id: 2, seat_id: 11, status: 'CANCELED', total_price: 150000, reason: 'Thay đổi lịch trình' },
    { user_id: 4, schedule_id: 6, seat_id: 150, status: 'CANCELED', total_price: 200000, reason: 'Hủy do thời tiết' },
];
// Book vé pending
const pendingTickets = [
    { user_id: 3, schedule_id: 1, seat_id: 3, status: 'PENDING', total_price: 200000, reason: null },
    { user_id: 5, schedule_id: 3, seat_id: 51, status: 'PENDING', total_price: 200000, reason: null },
    { user_id: 6, schedule_id: 7, seat_id: 200, status: 'PENDING', total_price: 250000, reason: null },
    { user_id: 7, schedule_id: 8, seat_id: 250, status: 'PENDING', total_price: 180000, reason: null }
];

// Payments - cho các vé thành công
const payments = [
    { ticket_id: 1, status: 'COMPLETED', order_amount: 200000, payment_method: 'VNPAY', payment_reference: 'VNPAY-0001', payment_provider_id: 1, notes: 'Giao dịch thành công VNPAY', created_at: new Date(), updated_at: new Date() },
    { ticket_id: 2, status: 'COMPLETED', order_amount: 150000, payment_method: 'MoMo', payment_reference: 'MOMO-0001', payment_provider_id: 2, notes: 'Thanh toán qua MoMo', created_at: new Date(), updated_at: new Date() },
    { ticket_id: 3, status: 'COMPLETED', order_amount: 200000, payment_method: 'ZaloPay', payment_reference: 'ZALO-0001', payment_provider_id: 4, notes: 'Thanh toán qua ZaloPay', created_at: new Date(), updated_at: new Date() },
    { ticket_id: 4, status: 'COMPLETED', order_amount: 150000, payment_method: 'BIDV', payment_reference: 'BIDV-0001', payment_provider_id: 5, notes: 'Chuyển khoản BIDV', created_at: new Date(), updated_at: new Date() },
    { ticket_id: 5, status: 'COMPLETED', order_amount: 250000, payment_method: 'Techcombank', payment_reference: 'TCB-0001', payment_provider_id: 6, notes: 'Chuyển khoản Techcombank', created_at: new Date(), updated_at: new Date() },
    { ticket_id: 6, status: 'REFUNDED', order_amount: 200000, payment_method: 'VNPAY', payment_reference: 'VNPAY-REF-001', payment_provider_id: 1, notes: 'Hoàn tiền do hủy vé', created_at: new Date(), updated_at: new Date() },
    { ticket_id: 7, status: 'REFUNDED', order_amount: 150000, payment_method: 'MoMo', payment_reference: 'MOMO-REF-001', payment_provider_id: 2, notes: 'Hoàn tiền do thay đổi lịch trình', created_at: new Date(), updated_at: new Date() },
    { ticket_id: 8, status: 'REFUNDED', order_amount: 200000, payment_method: 'AirPay', payment_reference: 'AIRPAY-REF-001', payment_provider_id: 7, notes: 'Hoàn tiền do thời tiết xấu', created_at: new Date(), updated_at: new Date() },
];

// Bus Reviews
const busReviews = [
    { user_id: 2, bus_id: 1, rating: 5, review: 'Xe sạch sẽ, tài xế vui vẻ, sẽ quay lại', created_at: new Date(), updated_at: new Date() },
    { user_id: 3, bus_id: 2, rating: 4, review: 'Chuyến đi an toàn, xe chạy đúng giờ', created_at: new Date(), updated_at: new Date() },
    { user_id: 4, bus_id: 3, rating: 5, review: 'Xe VIP rất thoải mái, dịch vụ tốt', created_at: new Date(), updated_at: new Date() },
    { user_id: 5, bus_id: 4, rating: 4, review: 'Giá cả hợp lý, xe ổn định', created_at: new Date(), updated_at: new Date() },
    { user_id: 6, bus_id: 5, rating: 5, review: 'Xe Kumho cao cấp, dịch vụ 5 sao', created_at: new Date(), updated_at: new Date() },
    { user_id: 2, bus_id: 2, rating: 3, review: 'Xe đông, điều hòa hơi yếu', created_at: new Date(), updated_at: new Date() },
    { user_id: 3, bus_id: 6, rating: 4, review: 'Xe Futa Standard ổn, giá tốt', created_at: new Date(), updated_at: new Date() },
    { user_id: 4, bus_id: 7, rating: 4, review: 'Mai Linh VIP có wifi, tiện lợi', created_at: new Date(), updated_at: new Date() },
    { user_id: 5, bus_id: 8, rating: 3, review: 'Hoàng Long Standard bình thường', created_at: new Date(), updated_at: new Date() },
    { user_id: 6, bus_id: 9, rating: 4, review: 'Thành Bưởi VIP có TV, giải trí tốt', created_at: new Date(), updated_at: new Date() },
    { user_id: 7, bus_id: 10, rating: 4, review: 'Kumho Standard chất lượng ổn', created_at: new Date(), updated_at: new Date() },
    { user_id: 2, bus_id: 3, rating: 5, review: 'Hoàng Long VIP rất đáng tiền', created_at: new Date(), updated_at: new Date() },
    { user_id: 3, bus_id: 4, rating: 3, review: 'Thành Bưởi Standard cần cải thiện', created_at: new Date(), updated_at: new Date() },
    { user_id: 4, bus_id: 5, rating: 5, review: 'Kumho Luxury tuyệt vời, recommend', created_at: new Date(), updated_at: new Date() },
    { user_id: 5, bus_id: 6, rating: 4, review: 'Futa Standard đáng tin cậy', created_at: new Date(), updated_at: new Date() }
];

// Banners & discount_banners
const banners = [
    { title: 'Giảm giá mùa hè', description: 'Book vé ngay nhận ưu đãi lớn!', image_url: '/uploads/banner1.jpg', link_url: '/khuyen-mai', is_active: true, display_order: 1, created_at: new Date(), updated_at: new Date() },
    { title: '50% cho tuyến TP.HCM - Cần Thơ', description: 'Khuyến mãi đặc biệt dịp 2/9!', image_url: '/uploads/banner2.jpg', link_url: '/sale/2-9', is_active: true, display_order: 2, created_at: new Date(), updated_at: new Date() },
    { title: 'Tết Nguyên Đán 2025', description: 'Đặt vé sớm nhận ưu đãi Tết!', image_url: '/uploads/banner-tet.jpg', link_url: '/tet-2025', is_active: true, display_order: 3, created_at: new Date(), updated_at: new Date() },
    { title: 'Tuyến miền Bắc mới', description: 'Khám phá Hà Nội - Đà Nẵng', image_url: '/uploads/banner-mien-bac.jpg', link_url: '/mien-bac', is_active: true, display_order: 4, created_at: new Date(), updated_at: new Date() },
    { title: 'Xe VIP cao cấp', description: 'Trải nghiệm dịch vụ 5 sao', image_url: '/uploads/banner-vip.jpg', link_url: '/xe-vip', is_active: true, display_order: 5, created_at: new Date(), updated_at: new Date() }
];

const discountBanners = [
    { title: 'Giảm sốc MoMo', description: 'Thanh toán MoMo giảm đến 30% giá vé', image_url: '/uploads/discount-momo.jpg', link_url: '/momo-discount', discount_percentage: 30.0, discount_amount: 60000, valid_from: '2025-01-01', valid_until: '2025-01-31', is_active: true, display_order: 1, created_at: new Date(), updated_at: new Date() },
    { title: 'VNPAY hoàn tiền', description: 'Giao dịch VNPAY hoàn 50K vào ví khách', image_url: '/uploads/vnpay-back.jpg', link_url: '/vnpay-cashback', discount_percentage: 0, discount_amount: 50000, valid_from: '2025-01-01', valid_until: '2025-12-31', is_active: true, display_order: 2, created_at: new Date(), updated_at: new Date() },
    { title: 'ZaloPay ưu đãi', description: 'Thanh toán ZaloPay giảm 20%', image_url: '/uploads/discount-zalopay.jpg', link_url: '/zalopay-discount', discount_percentage: 20.0, discount_amount: 40000, valid_from: '2025-01-15', valid_until: '2025-02-15', is_active: true, display_order: 3, created_at: new Date(), updated_at: new Date() },
    { title: 'Tết 2025', description: 'Đặt vé Tết giảm 25%', image_url: '/uploads/discount-tet.jpg', link_url: '/tet-discount', discount_percentage: 25.0, discount_amount: 100000, valid_from: '2025-01-20', valid_until: '2025-02-20', is_active: true, display_order: 4, created_at: new Date(), updated_at: new Date() },
    { title: 'Sinh nhật DatXe', description: 'Kỷ niệm 5 năm thành lập', image_url: '/uploads/discount-birthday.jpg', link_url: '/birthday-sale', discount_percentage: 15.0, discount_amount: 30000, valid_from: '2025-01-01', valid_until: '2025-12-31', is_active: true, display_order: 5, created_at: new Date(), updated_at: new Date() }
];

// Popular Routes
const popularRoutes = [
    { route_id: 1, booking_count: 120, average_rating: 4.5, total_revenue: 16000000, period_start: '2025-01-01', period_end: '2025-01-31', created_at: new Date(), updated_at: new Date() },
    { route_id: 2, booking_count: 80, average_rating: 4.2, total_revenue: 8000000, period_start: '2025-01-01', period_end: '2025-01-31', created_at: new Date(), updated_at: new Date() },
    { route_id: 3, booking_count: 60, average_rating: 4.3, total_revenue: 12000000, period_start: '2025-01-01', period_end: '2025-01-31', created_at: new Date(), updated_at: new Date() },
    { route_id: 4, booking_count: 45, average_rating: 4.1, total_revenue: 6750000, period_start: '2025-01-01', period_end: '2025-01-31', created_at: new Date(), updated_at: new Date() },
    { route_id: 5, booking_count: 35, average_rating: 4.7, total_revenue: 8750000, period_start: '2025-01-01', period_end: '2025-01-31', created_at: new Date(), updated_at: new Date() },
    { route_id: 6, booking_count: 25, average_rating: 4.4, total_revenue: 5000000, period_start: '2025-01-01', period_end: '2025-01-31', created_at: new Date(), updated_at: new Date() },
    { route_id: 7, booking_count: 20, average_rating: 4.6, total_revenue: 13000000, period_start: '2025-01-01', period_end: '2025-01-31', created_at: new Date(), updated_at: new Date() },
    { route_id: 8, booking_count: 55, average_rating: 4.0, total_revenue: 8250000, period_start: '2025-01-01', period_end: '2025-01-31', created_at: new Date(), updated_at: new Date() },
    { route_id: 9, booking_count: 30, average_rating: 4.3, total_revenue: 12000000, period_start: '2025-01-01', period_end: '2025-01-31', created_at: new Date(), updated_at: new Date() },
    { route_id: 10, booking_count: 40, average_rating: 4.2, total_revenue: 7200000, period_start: '2025-01-01', period_end: '2025-01-31', created_at: new Date(), updated_at: new Date() }
];

exports.seed = async function (knex) {
    // Disable foreign key checks temporarily
    await knex.raw('SET FOREIGN_KEY_CHECKS = 0');

    // Delete in reverse order of dependencies to respect foreign key constraints
    await knex('payments').del();
    await knex('bus_reviews').del();
    await knex('discount_banners').del();
    await knex('banners').del();
    await knex('popular_routes').del();
    await knex('tickets').del();
    await knex('seats').del();
    await knex('schedules').del();
    await knex('cars').del();
    await knex('routes').del();
    await knex('stations').del();
    await knex('bus_companies').del();
    await knex('users').del();
    await knex('payment_providers').del();

    // Insert in order of dependencies to respect foreign key constraints
    await knex('users').insert(users);
    await knex('bus_companies').insert(busCompanies);
    await knex('stations').insert(stations);
    await knex('payment_providers').insert(paymentProviders);
    await knex('routes').insert(routes);
    await knex('cars').insert(cars);
    await knex('schedules').insert(schedules);
    await knex('seats').insert(seats);
    await knex('tickets').insert(tickets);
    await knex('tickets').insert(pendingTickets);
    await knex('payments').insert(payments);
    await knex('bus_reviews').insert(busReviews);
    await knex('banners').insert(banners);
    await knex('discount_banners').insert(discountBanners);
    await knex('popular_routes').insert(popularRoutes);

    // Re-enable foreign key checks
    await knex.raw('SET FOREIGN_KEY_CHECKS = 1');
};
