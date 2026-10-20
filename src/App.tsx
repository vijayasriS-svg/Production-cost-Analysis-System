import React, { useState, useMemo, useEffect } from 'react';
import { 
  Download, CheckCircle2, AlertTriangle, ShieldCheck, 
  Layers, Cpu, Users, Box, BarChart3, Clock, DollarSign, Sparkles,
  LogOut, Lock, ArrowRight, ShieldAlert, Check,
  Plus, KeyRound, UserPlus, RefreshCw, X, Eye, EyeOff, Send, Pencil,
  Printer, Scissors, Bell
} from 'lucide-react';

// Seagull Printers Company Logo SVG matching user's uploaded image
export function SeagullLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 130" 
      className={className} 
      fill="none" 
      stroke="currentColor" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {/* Bird Head & Beak */}
      <path 
        d="M 28 36 C 20 36, 10 39, 7 42 C 14 44, 21 47, 24 49 C 22 57, 26 63, 34 65" 
        stroke="currentColor" 
        strokeWidth="6" 
      />
      {/* Bird Eye */}
      <circle cx="38" cy="30" r="5" fill="currentColor" stroke="none" />
      {/* Crown / Top of Head curving into top of S */}
      <path 
        d="M 28 36 C 30 18, 52 14, 62 25 C 72 36, 68 55, 52 64" 
        stroke="currentColor" 
        strokeWidth="6" 
      />
      {/* S curve crossing into lower loop */}
      <path 
        d="M 34 65 C 44 65, 80 63, 88 77 C 96 92, 82 110, 62 111 C 44 112, 28 99, 24 86" 
        stroke="currentColor" 
        strokeWidth="6" 
      />
      {/* Vertical Pen / Nib Stem of P with rounded tip */}
      <path 
        d="M 46 68 C 41 68, 38 72, 38 78 L 41 126 C 41 129, 45 129, 46 126 L 48 78 C 48 72, 45 68, 46 68 Z" 
        fill="currentColor" 
        stroke="currentColor" 
        strokeWidth="2" 
      />
      {/* Right P inner loop */}
      <path 
        d="M 44 74 C 65 74, 82 81, 80 93 C 78 103, 62 107, 45 105" 
        stroke="currentColor" 
        strokeWidth="4.5" 
      />
    </svg>
  );
}

interface SystemUser {
  id: number;
  username: string;
  password: string; // Stored securely
  fullName: string;
  email: string;
  role: 'ROLE_ADMIN' | 'ROLE_MANAGER' | 'ROLE_PRODUCTION_STAFF';
  roleName: 'System Administrator' | 'Production Manager' | 'Floor Operator';
  mustChangePassword: boolean;
  createdAt: string;
}

export default function App() {
  // Database of Users
  const [users, setUsers] = useState<SystemUser[]>([
    {
      id: 1,
      username: 'admin',
      password: 'seagull123',
      fullName: 'System Administrator',
      email: 'admin@seagullprinters.com',
      role: 'ROLE_ADMIN',
      roleName: 'System Administrator',
      mustChangePassword: false,
      createdAt: '2024-01-10',
    },
    {
      id: 2,
      username: 'manager',
      password: 'seagull123',
      fullName: 'Production Manager',
      email: 'manager@seagullprinters.com',
      role: 'ROLE_MANAGER',
      roleName: 'Production Manager',
      mustChangePassword: false,
      createdAt: '2024-02-15',
    },
    {
      id: 3,
      username: 'staff',
      password: 'seagull123',
      fullName: 'Floor Operator',
      email: 'operator@seagullprinters.com',
      role: 'ROLE_PRODUCTION_STAFF',
      roleName: 'Floor Operator',
      mustChangePassword: false,
      createdAt: '2024-03-01',
    },
  ]);

  // Authentication State - Password must be entered by user only
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // First-Time Password Change Modal State
  const [forcePasswordUser, setForcePasswordUser] = useState<SystemUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');

  // Admin "Create New User" Modal State
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'ROLE_ADMIN' | 'ROLE_MANAGER' | 'ROLE_PRODUCTION_STAFF'>('ROLE_PRODUCTION_STAFF');
  const [newInitialPassword, setNewInitialPassword] = useState('Seagull2026!');
  const [userCreationSuccess, setUserCreationSuccess] = useState<string | null>(null);
  const [userCreationError, setUserCreationError] = useState<string | null>(null);
  // Password Reset Request (Manager/Staff Request -> Admin Authorization Only)
  interface PasswordResetRequest {
    id: number;
    userId: number;
    username: string;
    fullName: string;
    roleName: string;
    requestedAt: string;
    reason: string;
  }

  const [resetRequests, setResetRequests] = useState<PasswordResetRequest[]>([
    {
      id: 1,
      userId: 2,
      username: 'manager',
      fullName: 'Production Manager',
      roleName: 'Production Manager',
      requestedAt: '15 mins ago',
      reason: 'Forgot workstation password after system restart',
    }
  ]);

  // Forgot Password Modal on Login Screen
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotUsernameInput, setForgotUsernameInput] = useState('');
  const [forgotReasonInput, setForgotReasonInput] = useState('');
  const [forgotModalMessage, setForgotModalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Admin Reset Password Modal
  const [resetTargetUser, setResetTargetUser] = useState<SystemUser | null>(null);
  const [adminTempResetPassword, setAdminTempResetPassword] = useState('SeagullReset2026!');
  const [adminResetSuccessMessage, setAdminResetSuccessMessage] = useState<string | null>(null);

  // Real-Time Popup Message Bar / Notification Toast State
  const [popupToast, setPopupToast] = useState<{
    id: number;
    title: string;
    message: string;
    type: 'success' | 'info' | 'warning';
    timestamp: string;
  } | null>(null);

  const triggerPopupMessage = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const newToast = {
      id: Date.now(),
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setPopupToast(newToast);
  };

  useEffect(() => {
    if (!popupToast) return;
    const timer = setTimeout(() => {
      setPopupToast(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [popupToast]);

  // Active Module in App
  const [activeModule, setActiveModule] = useState<
    'dashboard' | 'products' | 'materials' | 'labour' | 'machines' | 'expenses' | 'analysis' | 'roles'
  >('dashboard');

  // Product Catalog State
  const [simProducts, setSimProducts] = useState([
    { id: 1, code: 'PRD-101', name: 'Corporate Tri-fold Brochure (A4 150gsm Gloss)', category: 'Marketing Collateral', cost: 0.85, price: 2.20, active: true, description: 'Full color 4/4 printing, double parallel fold, gloss lamination' },
    { id: 2, code: 'PRD-102', name: 'Premium Hardcover Annual Report (100pp)', category: 'Booklets & Publishing', cost: 12.50, price: 28.00, active: true, description: 'Section sewn, case bound, matte lamination, spot UV' },
    { id: 3, code: 'PRD-103', name: 'Matte Finish Visiting Cards (Pack of 500)', category: 'Visiting Cards & Stationery', cost: 8.20, price: 25.00, active: true, description: '350gsm Silk card stock, double-sided CMYK with velvety matte finish' },
    { id: 4, code: 'PRD-104', name: 'Corrugated Shipping Boxes (Printed 3-ply)', category: 'Packaging', cost: 1.40, price: 3.50, active: true, description: 'Kraft paper outer, flexographic 2-color print, die-cut' },
    { id: 5, code: 'PRD-105', name: 'High-Gloss Product Labels (Roll of 1000)', category: 'Labels & Stickers', cost: 14.00, price: 32.00, active: true, description: 'Waterproof synthetic PP roll labels, permanent adhesive' },
  ]);

  // Product Creation / Editing Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productCodeInput, setProductCodeInput] = useState('PRD-106');
  const [productNameInput, setProductNameInput] = useState('');
  const [productCategoryInput, setProductCategoryInput] = useState('Visiting Cards & Stationery');
  const [productCostInput, setProductCostInput] = useState<number>(8.20);
  const [productPriceInput, setProductPriceInput] = useState<number>(25.00);
  const [productDescInput, setProductDescInput] = useState('');
  const [productMessage, setProductMessage] = useState<string | null>(null);

  const [simMaterials, setSimMaterials] = useState([
    { id: 1, code: 'MAT-001', name: 'Art Gloss Paper 150gsm (640x900mm)', unit: 'Reams', price: 42.50, stock: 115.0, minAlert: 25.0 },
    { id: 2, code: 'MAT-002', name: 'Silk Board 350gsm (700x1000mm)', unit: 'Sheets', price: 0.38, stock: 4200.0, minAlert: 5000.0 }, // Low Stock
    { id: 3, code: 'MAT-003', name: 'Process Cyan Offset Ink (Grade A)', unit: 'Kg', price: 18.20, stock: 54.0, minAlert: 15.0 },
    { id: 4, code: 'MAT-004', name: 'Process Magenta Offset Ink (Grade A)', unit: 'Kg', price: 18.50, stock: 48.0, minAlert: 15.0 },
    { id: 5, code: 'MAT-005', name: 'Process Yellow Offset Ink (Grade A)', unit: 'Kg', price: 18.00, stock: 52.0, minAlert: 15.0 },
    { id: 6, code: 'MAT-006', name: 'Process Black Dense Offset Ink', unit: 'Kg', price: 14.50, stock: 85.0, minAlert: 20.0 },
    { id: 7, code: 'MAT-007', name: 'Thermal CTP Aluminum Plates', unit: 'Plates', price: 6.80, stock: 18.0, minAlert: 30.0 }, // Low Stock
    { id: 8, code: 'MAT-008', name: 'Matte Thermal Lamination Film (320mm x 200m)', unit: 'Rolls', price: 65.00, stock: 14.8, minAlert: 4.0 },
    { id: 9, code: 'MAT-009', name: 'Process Inks (CMYK Blend / Allowance)', unit: 'Lot', price: 5.00, stock: 45.0, minAlert: 10.0 },
  ]);

  const [simMovements, setSimMovements] = useState([
    { id: 1, mat: 'Silk Board 350gsm (700x1000mm)', type: 'CONSUMPTION' as const, qty: 25.0, cost: 9.50, note: 'Order #VIS-500: Deduct 25 parent sheets for 500 visiting cards ($9.50)' },
    { id: 2, mat: 'Thermal CTP Aluminum Plates', type: 'CONSUMPTION' as const, qty: 4.0, cost: 27.20, note: 'Order #VIS-500: Deduct 4 plates (CMYK separation) ($27.20)' },
    { id: 3, mat: 'Matte Thermal Lamination Film (320mm x 200m)', type: 'CONSUMPTION' as const, qty: 0.2, cost: 13.00, note: 'Order #VIS-500: Deduct 0.2 roll matte thermal film ($13.00)' },
    { id: 4, mat: 'Process Inks (CMYK Blend / Allowance)', type: 'CONSUMPTION' as const, qty: 1.0, cost: 5.00, note: 'Order #VIS-500: Deduct process ink allowance ($5.00)' },
    { id: 5, mat: 'Art Gloss Paper 150gsm (640x900mm)', type: 'CONSUMPTION' as const, qty: 12.0, cost: 510.0, note: 'PROD-2024-001 batch run' },
    { id: 6, mat: 'Process Cyan Offset Ink (Grade A)', type: 'PURCHASE' as const, qty: 25.0, cost: 455.0, note: 'Supplier PO #7890' },
  ]);

  // Labour Calculator state
  const [labourWorkers, setLabourWorkers] = useState(2);
  const [labourHours, setLabourHours] = useState(6.5);
  const [labourRate, setLabourRate] = useState(22.0);
  const totalLabourCalculated = useMemo(() => labourWorkers * labourHours * labourRate, [labourWorkers, labourHours, labourRate]);

  // Machine Production state
  const [prodBatch, setProdBatch] = useState('BATCH-BROCH-01');
  const [prodTotalQty, setProdTotalQty] = useState(5000);
  const [prodRejectedQty, setProdRejectedQty] = useState(150);
  const [machineHours, setMachineHours] = useState(6.5);
  const [machineRate, setMachineRate] = useState(45.0);
  const netGoodQty = useMemo(() => Math.max(0, prodTotalQty - prodRejectedQty), [prodTotalQty, prodRejectedQty]);
  const totalMachineCost = useMemo(() => machineHours * machineRate, [machineHours, machineRate]);
  const [prodNotes, setProdNotes] = useState('Client approved 350gsm matte card design. Sample card testing completed.');
  const [prodMachineName, setProdMachineName] = useState('Heidelberg Printmaster / Digital Press');

  // Machine Production Runs Table & Modal State
  const [simProductionRuns, setSimProductionRuns] = useState([
    {
      id: 1,
      orderCode: 'PROD-2024-001',
      productId: 1,
      productName: 'Corporate Tri-fold Brochure (A4 150gsm Gloss)',
      machineName: 'Heidelberg Speedmaster XL 75',
      batchNumber: 'BATCH-BROCH-01',
      quantityProduced: 5000,
      quantityRejected: 150,
      netGoodQuantity: 4850,
      machineHours: 6.5,
      machineHourlyRate: 45.0,
      machineCost: 292.50,
      productionDate: '2026-10-18',
      status: 'COMPLETED',
      notes: 'Standard 4-color offset press run with glossy UV coating'
    },
    {
      id: 2,
      orderCode: 'PROD-2024-002',
      productId: 3,
      productName: 'Matte Finish Visiting Cards (Pack of 500)',
      machineName: 'Heidelberg Printmaster / Digital Press',
      batchNumber: 'BATCH-VIS-500',
      quantityProduced: 500,
      quantityRejected: 15,
      netGoodQuantity: 485,
      machineHours: 1.5,
      machineHourlyRate: 40.0,
      machineCost: 60.00,
      productionDate: '2026-10-19',
      status: 'IN_PROGRESS',
      notes: 'Order #VIS-500: Client approved 350gsm matte visiting card sample. Developing 500 cards run.'
    }
  ]);

  const [showNewRunModal, setShowNewRunModal] = useState(false);
  const [newRunProductId, setNewRunProductId] = useState<number>(3);
  const [newRunMachineName, setNewRunMachineName] = useState('Heidelberg Printmaster / Digital Press');
  const [newRunOrderCode, setNewRunOrderCode] = useState('PROD-2024-003');
  const [newRunBatch, setNewRunBatch] = useState('BATCH-VIS-02');
  const [newRunTotalQty, setNewRunTotalQty] = useState(500);
  const [newRunRejectedQty, setNewRunRejectedQty] = useState(15);
  const [newRunHours, setNewRunHours] = useState(1.5);
  const [newRunRate, setNewRunRate] = useState(40.0);
  const [newRunDate, setNewRunDate] = useState('2026-10-20');
  const [newRunStatus, setNewRunStatus] = useState('IN_PROGRESS');
  const [newRunNotes, setNewRunNotes] = useState('Client design accepted. Developing 500 cards based on approved sample.');
  const [runSuccessMsg, setRunSuccessMsg] = useState<string | null>(null);

  // Expenses calculator state
  const [expenseQty, setExpenseQty] = useState(1);
  const [expenseUnitPrice, setExpenseUnitPrice] = useState(85.0);
  const totalExpense = useMemo(() => expenseQty * expenseUnitPrice, [expenseQty, expenseUnitPrice]);

  // Labour Cost Table & Modal State
  const [simLabourRecords, setSimLabourRecords] = useState([
    {
      id: 1,
      code: 'LBR-1001',
      description: 'Pre-press setup & Heidelberg press operation',
      productionCode: 'PROD-2024-001',
      workers: 2,
      hours: 6.5,
      rate: 22.0,
      totalCost: 286.00,
      date: '2026-10-18',
      notes: 'Senior press operator and feeder assistant'
    },
    {
      id: 2,
      code: 'LBR-1002',
      description: 'Tri-fold folding, quality inspection & bundling',
      productionCode: 'PROD-2024-001',
      workers: 2,
      hours: 4.0,
      rate: 16.5,
      totalCost: 132.00,
      date: '2026-10-19',
      notes: 'Post-press bindery operators'
    },
    {
      id: 3,
      code: 'LBR-1003',
      description: 'Press Operation & Printing',
      productionCode: 'PROD-2024-002',
      workers: 1,
      hours: 1.0,
      rate: 22.0,
      totalCost: 22.00,
      date: '2026-10-20',
      notes: 'Preset standard workshop rate: 1 Worker × 1.0 hr @ $22.00/hr = $22.00 (Order #VIS-500)'
    },
    {
      id: 4,
      code: 'LBR-1004',
      description: 'Guillotine Trimming, Packing & Inspection',
      productionCode: 'PROD-2024-002',
      workers: 1,
      hours: 0.5,
      rate: 16.0,
      totalCost: 8.00,
      date: '2026-10-20',
      notes: 'Preset standard workshop rate: 1 Worker × 0.5 hr @ $16.00/hr = $8.00 (Order #VIS-500)'
    }
  ]);

  // Preset Standard Workshop Rates
  const presetStandardWorkshopRates = [
    {
      id: 'press',
      name: 'Press Operation & Printing',
      workers: 1,
      hours: 1.0,
      rate: 22.00,
      cost: 22.00,
      formula: '1 Worker × 1.0 hour @ $22.00 = $22.00',
      description: 'Offset / Digital press makeready, 4-color plate mounting, ink flow calibration & high-speed run',
      badge: 'Presswork'
    },
    {
      id: 'guillotine',
      name: 'Guillotine Trimming, Packing & Inspection',
      workers: 1,
      hours: 0.5,
      rate: 16.00,
      cost: 8.00,
      formula: '1 Worker × 0.5 hour @ $16.00/hr = $8.00',
      description: 'Hydraulic guillotine precision shearing (85×55mm cards), sorting, batch shrink-wrap & quality inspection',
      badge: 'Finishing'
    }
  ];

  const [showLabourModal, setShowLabourModal] = useState(false);
  const [newLabourCode, setNewLabourCode] = useState('LBR-1005');
  const [newLabourDesc, setNewLabourDesc] = useState('Press Operation & Printing');
  const [newLabourProdCode, setNewLabourProdCode] = useState('PROD-2024-002');
  const [newLabourWorkers, setNewLabourWorkers] = useState(1);
  const [newLabourHours, setNewLabourHours] = useState(1.0);
  const [newLabourRate, setNewLabourRate] = useState(22.0);
  const [newLabourDate, setNewLabourDate] = useState('2026-10-20');
  const [newLabourNotes, setNewLabourNotes] = useState('Preset standard workshop rate: 1 Worker × 1.0 hr @ $22.00 = $22.00');
  const [labourSuccessMsg, setLabourSuccessMsg] = useState<string | null>(null);

  // Other Expenses Table & Modal State
  const [simExpenseRecords, setSimExpenseRecords] = useState([
    {
      id: 1,
      code: 'EXP-5001',
      type: 'Electricity',
      description: 'Press energy allocation (industrial meter reading)',
      productionCode: 'PROD-2024-001',
      quantity: 1.0,
      unitPrice: 85.00,
      totalCost: 85.00,
      date: '2026-10-18'
    },
    {
      id: 2,
      code: 'EXP-5002',
      type: 'Packaging',
      description: 'Heavy-duty cartons and moisture-barrier wrap',
      productionCode: 'PROD-2024-001',
      quantity: 25.0,
      unitPrice: 2.50,
      totalCost: 62.50,
      date: '2026-10-19'
    },
    {
      id: 3,
      code: 'EXP-5003',
      type: 'Transport',
      description: 'Courier pallet delivery to corporate client HQ',
      productionCode: 'PROD-2024-001',
      quantity: 1.0,
      unitPrice: 75.00,
      totalCost: 75.00,
      date: '2026-10-19'
    },
    {
      id: 4,
      code: 'EXP-5004',
      type: 'Packaging',
      description: 'Visiting Card Acrylic / Cardboard Box',
      productionCode: 'PROD-2024-002',
      quantity: 1.0,
      unitPrice: 1.50,
      totalCost: 1.50,
      date: '2026-10-20'
    },
    {
      id: 5,
      code: 'EXP-5005',
      type: 'Transport',
      description: 'Local Courier / Delivery',
      productionCode: 'PROD-2024-002',
      quantity: 1.0,
      unitPrice: 5.00,
      totalCost: 5.00,
      date: '2026-10-20'
    }
  ]);

  // Preset Standard Job Overheads
  const presetStandardOverheads = [
    {
      id: 'box',
      name: 'Visiting Card Acrylic / Cardboard Box',
      type: 'Packaging',
      quantity: 1.0,
      unitPrice: 1.50,
      cost: 1.50,
      formula: '1 unit × $1.50 = $1.50',
      description: 'Protective clear acrylic / premium cardboard presentation packaging box',
      badge: 'Packaging'
    },
    {
      id: 'courier',
      name: 'Local Courier / Delivery',
      type: 'Transport',
      quantity: 1.0,
      unitPrice: 5.00,
      cost: 5.00,
      formula: '1 delivery × $5.00 = $5.00',
      description: 'Local same-day parcel courier & door-to-door dispatched delivery',
      badge: 'Logistics'
    }
  ];

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [newExpenseCode, setNewExpenseCode] = useState('EXP-5006');
  const [newExpenseType, setNewExpenseType] = useState('Packaging');
  const [newExpenseDesc, setNewExpenseDesc] = useState('Visiting Card Acrylic / Cardboard Box');
  const [newExpenseProdCode, setNewExpenseProdCode] = useState('PROD-2024-002');
  const [newExpenseQuantity, setNewExpenseQuantity] = useState(1.0);
  const [newExpenseUnitPrice, setNewExpenseUnitPrice] = useState(1.50);
  const [newExpenseDate, setNewExpenseDate] = useState('2026-10-20');
  const [expenseSuccessMsg, setExpenseSuccessMsg] = useState<string | null>(null);

  // Production Cost & Profit Analysis Table & Modal State
  const [simAnalysisRecords, setSimAnalysisRecords] = useState([
    {
      id: 1,
      code: 'ANA-2024-001',
      productionCode: 'PROD-2024-001',
      productName: 'Corporate Tri-fold Brochure (A4 150gsm Gloss)',
      rawMaterialCost: 828.50,
      labourCost: 418.00,
      machineCost: 292.50,
      otherExpenseCost: 222.50,
      totalCost: 1761.50,
      producedQty: 5000,
      costPerUnit: 0.3523,
      actualSoldQty: 4850,
      sellingPrice: 2.20,
      revenue: 10670.00,
      cogs: 1708.66,
      profit: 8961.34,
      profitMarginPct: 83.99,
      date: '2026-10-19'
    },
    {
      id: 2,
      code: 'ANA-2024-002',
      productionCode: 'PROD-2024-002',
      productName: 'Matte Finish Visiting Cards (Pack of 500)',
      rawMaterialCost: 54.70,
      labourCost: 30.00,
      machineCost: 25.76,
      otherExpenseCost: 6.50,
      totalCost: 116.96,
      producedQty: 500,
      costPerUnit: 0.2339,
      actualSoldQty: 500,
      sellingPrice: 0.36,
      revenue: 180.00,
      cogs: 116.96,
      profit: 63.04,
      profitMarginPct: 35.02,
      date: '2026-10-20'
    }
  ]);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [newAnaCode, setNewAnaCode] = useState('ANA-2024-003');
  const [newAnaProdCode, setNewAnaProdCode] = useState('PROD-2024-002');
  const [newAnaMatCost, setNewAnaMatCost] = useState(54.70);
  const [newAnaLabCost, setNewAnaLabCost] = useState(30.00);
  const [newAnaMachCost, setNewAnaMachCost] = useState(25.76);
  const [newAnaExpCost, setNewAnaExpCost] = useState(6.50);
  const [newAnaProducedQty, setNewAnaProducedQty] = useState(500);
  const [newAnaSellingPrice, setNewAnaSellingPrice] = useState(0.36);
  const [newAnaSoldQty, setNewAnaSoldQty] = useState(500);
  const [analysisSuccessMsg, setAnalysisSuccessMsg] = useState<string | null>(null);

  // Production Cost & Profit Analysis live state
  const [analysisMatCost, setAnalysisMatCost] = useState(828.50);
  const [analysisLabCost, setAnalysisLabCost] = useState(418.00);
  const [analysisMachCost, setAnalysisMachCost] = useState(292.50);
  const [analysisExpCost, setAnalysisExpCost] = useState(222.50);
  const [analysisUnitsProduced, setAnalysisUnitsProduced] = useState(5000);
  const [analysisActualSold, setAnalysisActualSold] = useState(4850);
  const [analysisSellingPrice, setAnalysisSellingPrice] = useState(2.20);
  const [analysisSalesRecorded, setAnalysisSalesRecorded] = useState(true);

  // Authoritative Mathematical formulas
  const totalProdCost = useMemo(() => {
    return analysisMatCost + analysisLabCost + analysisMachCost + analysisExpCost;
  }, [analysisMatCost, analysisLabCost, analysisMachCost, analysisExpCost]);

  const costPerUnit = useMemo(() => {
    return analysisUnitsProduced > 0 ? (totalProdCost / analysisUnitsProduced) : 0;
  }, [totalProdCost, analysisUnitsProduced]);

  const realizedRevenue = useMemo(() => {
    if (!analysisSalesRecorded || analysisActualSold <= 0) return 0;
    return analysisActualSold * analysisSellingPrice;
  }, [analysisSalesRecorded, analysisActualSold, analysisSellingPrice]);

  const cogs = useMemo(() => {
    if (!analysisSalesRecorded || analysisActualSold <= 0) return 0;
    return costPerUnit * analysisActualSold;
  }, [analysisSalesRecorded, analysisActualSold, costPerUnit]);

  const realizedProfit = useMemo(() => {
    if (!analysisSalesRecorded || analysisActualSold <= 0) return 0;
    return realizedRevenue - cogs;
  }, [analysisSalesRecorded, analysisActualSold, realizedRevenue, cogs]);

  const profitMarginPct = useMemo(() => {
    if (realizedRevenue <= 0) return 0;
    return (realizedProfit / realizedRevenue) * 100;
  }, [realizedProfit, realizedRevenue]);

  // Stock deduction form state
  const [deductMatId, setDeductMatId] = useState(2); // Silk Board 350gsm default
  const [deductQty, setDeductQty] = useState(25.0);
  const [deductNote, setDeductNote] = useState('Order #VIS-500: Deduct 25 parent sheets for 500 visiting cards ($9.50)');
  const [deductMsg, setDeductMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dedicated Record Consumption Modal state
  const [showConsumptionModal, setShowConsumptionModal] = useState(false);
  const [modalConsumeMatId, setModalConsumeMatId] = useState<number>(2); // Silk Board 350gsm
  const [modalConsumeQty, setModalConsumeQty] = useState<number>(25.0);
  const [modalConsumeOrderCode, setModalConsumeOrderCode] = useState<string>('PROD-2024-002');
  const [modalConsumeWasteQty, setModalConsumeWasteQty] = useState<number>(2.0);
  const [modalConsumeNote, setModalConsumeNote] = useState<string>('Order #VIS-500: Deduct 25 parent sheets for 500 visiting cards ($9.50)');
  const [modalConsumeMsg, setModalConsumeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Visiting Card 500 Standard Raw Material Package (Recipe)
  const visitingCard500Materials = useMemo(() => [
    {
      matId: 2,
      code: 'MAT-002',
      name: 'Silk Board 350gsm (700x1000mm)',
      shortName: 'Silk Board 350gsm',
      qty: 25.0,
      unit: 'Sheets',
      unitPrice: 0.38,
      cost: 9.50,
      waste: 2.0,
      note: 'Order #VIS-500: Deduct 25 parent sheets for 500 visiting cards ($9.50)',
      formula: '25 parent sheets × $0.38 = $9.50',
      description: 'Deduct 25 parent sheets (e.g. 25 sheets × $0.38 = $9.50)'
    },
    {
      matId: 7,
      code: 'MAT-007',
      name: 'Thermal CTP Aluminum Plates',
      shortName: 'Thermal CTP Plates',
      qty: 4.0,
      unit: 'Plates',
      unitPrice: 6.80,
      cost: 27.20,
      waste: 0,
      note: 'Order #VIS-500: Deduct 4 plates (CMYK separation) = $27.20',
      formula: '4 plates (CMYK) × $6.80 = $27.20',
      description: 'Deduct 4 plates (CMYK separation) = $27.20'
    },
    {
      matId: 8,
      code: 'MAT-008',
      name: 'Matte Thermal Lamination Film (320mm x 200m)',
      shortName: 'Matte Thermal Film',
      qty: 0.2,
      unit: 'Rolls',
      unitPrice: 65.00,
      cost: 13.00,
      waste: 0.02,
      note: 'Order #VIS-500: Deduct 0.2 roll matte thermal lamination ($13.00)',
      formula: '0.2 roll × $65.00 = $13.00',
      description: 'Deduct 0.2 roll = $13.00'
    },
    {
      matId: 9,
      code: 'MAT-009',
      name: 'Process Inks (CMYK Blend / Allowance)',
      shortName: 'Process Inks Allowance',
      qty: 1.0,
      unit: 'Lot',
      unitPrice: 5.00,
      cost: 5.00,
      waste: 0,
      note: 'Order #VIS-500: Deduct process ink allowance ($5.00)',
      formula: '1 ink allowance = $5.00',
      description: 'Deduct ink allowance = $5.00'
    }
  ], []);

  const handleSelectVisitingCardMaterial = (preset: typeof visitingCard500Materials[0]) => {
    setDeductMatId(preset.matId);
    setDeductQty(preset.qty);
    setDeductNote(preset.note);
    setModalConsumeMatId(preset.matId);
    setModalConsumeQty(preset.qty);
    setModalConsumeWasteQty(preset.waste);
    setModalConsumeNote(preset.note);
  };

  const handleBatchDeductVisitingCard500 = () => {
    // Check if sufficient stock for all 4 materials
    for (const item of visitingCard500Materials) {
      const mat = simMaterials.find(m => m.id === item.matId);
      if (!mat || mat.stock < item.qty) {
        setDeductMsg({
          type: 'error',
          text: `Batch Deduction Aborted: Insufficient stock for ${item.shortName}! Available: ${mat ? mat.stock : 0} ${item.unit}, Required: ${item.qty} ${item.unit}.`
        });
        return;
      }
    }

    // Deduct stock for all 4 materials
    setSimMaterials(prev => prev.map(m => {
      const found = visitingCard500Materials.find(item => item.matId === m.id);
      if (found) {
        return { ...m, stock: Number((m.stock - found.qty).toFixed(2)) };
      }
      return m;
    }));

    // Prepend 4 records to movements ledger
    const timestamp = Date.now();
    const newMovements = visitingCard500Materials.map((item, idx) => ({
      id: timestamp + idx,
      mat: item.name,
      type: 'CONSUMPTION' as const,
      qty: item.qty,
      cost: item.cost,
      note: item.note
    }));

    setSimMovements(prev => [...newMovements, ...prev]);

    setDeductMsg({
      type: 'success',
      text: `Batch Deduction Complete! Deducted 4 Materials for Visiting Card 500 (Total: $54.70): Silk Board (25 sheets = $9.50), Thermal CTP Plates (4 plates = $27.20), Matte Lamination Film (0.2 roll = $13.00), Process Inks ($5.00). Stock & audit ledger updated!`
    });
  };

  const handleOpenConsumptionModalForMaterial = (matId: number) => {
    setModalConsumeMatId(matId);
    setDeductMatId(matId);
    const mat = simMaterials.find(m => m.id === matId);
    if (mat) {
      setModalConsumeNote(`Consumption deduction for ${mat.name} on Order #VIS-500`);
    }
    setModalConsumeMsg(null);
    setShowConsumptionModal(true);
  };

  const handleModalRecordConsumption = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMat = simMaterials.find(m => m.id === Number(modalConsumeMatId));
    if (!targetMat) return;

    const totalToDeduct = Number(modalConsumeQty) || 0;
    if (targetMat.stock < totalToDeduct) {
      setModalConsumeMsg({
        type: 'error',
        text: `Transaction Rejected: Insufficient stock for ${targetMat.name}! Available: ${targetMat.stock} ${targetMat.unit}, Requested: ${totalToDeduct} ${targetMat.unit}`
      });
      return;
    }

    setSimMaterials(prev => prev.map(m => {
      if (m.id === targetMat.id) {
        return { ...m, stock: Number((m.stock - totalToDeduct).toFixed(2)) };
      }
      return m;
    }));

    const totalCost = Number((totalToDeduct * targetMat.price).toFixed(2));
    const fullNote = modalConsumeOrderCode
      ? `[${modalConsumeOrderCode}] ${modalConsumeNote.trim() || 'Production consumption'}${modalConsumeWasteQty > 0 ? ` (Includes ${modalConsumeWasteQty} waste/defect)` : ''}`
      : (modalConsumeNote.trim() || 'Production consumption');

    setSimMovements(prev => [
      {
        id: Date.now(),
        mat: targetMat.name,
        type: 'CONSUMPTION',
        qty: totalToDeduct,
        cost: totalCost,
        note: fullNote
      },
      ...prev
    ]);

    setDeductMsg({
      type: 'success',
      text: `Successfully recorded consumption of ${totalToDeduct} ${targetMat.unit} of ${targetMat.name}. Stock updated automatically in inventory ledger!`
    });
    setShowConsumptionModal(false);
  };

  const handleDeductStock = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMat = simMaterials.find(m => m.id === Number(deductMatId));
    if (!targetMat) return;

    if (targetMat.stock < deductQty) {
      setDeductMsg({
        type: 'error',
        text: `Transaction Rejected: Insufficient stock for ${targetMat.name}! Available: ${targetMat.stock} ${targetMat.unit}, Requested: ${deductQty} ${targetMat.unit}`
      });
      return;
    }

    setSimMaterials(prev => prev.map(m => {
      if (m.id === targetMat.id) {
        return { ...m, stock: Number((m.stock - deductQty).toFixed(2)) };
      }
      return m;
    }));

    setSimMovements(prev => [
      {
        id: Date.now(),
        mat: targetMat.name,
        type: 'CONSUMPTION',
        qty: deductQty,
        cost: Number((deductQty * targetMat.price).toFixed(2)),
        note: deductNote.trim() || `Manual batch deduction for production order`
      },
      ...prev
    ]);

    setDeductMsg({
      type: 'success',
      text: `Successfully deducted ${deductQty} ${targetMat.unit} of ${targetMat.name}. Stock updated automatically!`
    });
  };

  // Login handler - password must be entered by user
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetUsername = loginUsername.trim().toLowerCase();
    const targetPassword = loginPassword;
    setLoginError('');
    setLoginSuccess('');

    if (!targetUsername) {
      setLoginError('Please enter your username.');
      return;
    }

    if (!targetPassword) {
      setLoginError('Please enter your password.');
      return;
    }

    setIsAuthenticating(true);

    setTimeout(() => {
      setIsAuthenticating(false);
      const user = users.find(u => u.username.toLowerCase() === targetUsername);

      if (!user) {
        setLoginError('Invalid credentials. User not found.');
        return;
      }

      if (user.password !== targetPassword) {
        setLoginError('Incorrect password. Please verify credentials or use your updated password.');
        return;
      }

      // Check if user is required to change password on first login
      if (user.mustChangePassword) {
        setForcePasswordUser(user);
        setNewPassword('');
        setConfirmPassword('');
        setPasswordChangeError('');
        return;
      }

      // Successful login
      setCurrentUser(user);
      if (user.role === 'ROLE_PRODUCTION_STAFF') {
        setActiveModule('machines');
      } else {
        setActiveModule('dashboard');
      }
    }, 350);
  };

  // First-time password change submit handler
  const handleFirstTimePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError('');

    if (!forcePasswordUser) return;

    if (newPassword.length < 6) {
      setPasswordChangeError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordChangeError('Passwords do not match. Please re-enter.');
      return;
    }

    if (newPassword === forcePasswordUser.password) {
      setPasswordChangeError('New password cannot be the same as the initial temporary password.');
      return;
    }

    // Update user in state with updated password and mustChangePassword = false
    const updatedUser: SystemUser = {
      ...forcePasswordUser,
      password: newPassword,
      mustChangePassword: false,
    };

    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setForcePasswordUser(null);
    setCurrentUser(updatedUser);
    setLoginSuccess(`Password updated successfully! Welcome to Seagull Printers, ${updatedUser.fullName}.`);

    if (updatedUser.role === 'ROLE_PRODUCTION_STAFF') {
      setActiveModule('machines');
    } else {
      setActiveModule('dashboard');
    }
  };

  // Admin Create New User Handler
  const handleAdminCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserCreationError(null);
    setUserCreationSuccess(null);

    const cleanUsername = newUsername.trim().toLowerCase();
    if (!cleanUsername) {
      setUserCreationError('Username is required.');
      return;
    }

    if (users.some(u => u.username.toLowerCase() === cleanUsername)) {
      setUserCreationError(`Username "${cleanUsername}" is already taken. Please choose another.`);
      return;
    }

    if (!newFullName.trim()) {
      setUserCreationError('Full Name is required.');
      return;
    }

    if (!newInitialPassword || newInitialPassword.length < 4) {
      setUserCreationError('Initial password must be at least 4 characters.');
      return;
    }

    const roleNameMap: Record<string, 'System Administrator' | 'Production Manager' | 'Floor Operator'> = {
      ROLE_ADMIN: 'System Administrator',
      ROLE_MANAGER: 'Production Manager',
      ROLE_PRODUCTION_STAFF: 'Floor Operator',
    };

    const createdUser: SystemUser = {
      id: Date.now(),
      username: cleanUsername,
      password: newInitialPassword,
      fullName: newFullName.trim(),
      email: newEmail.trim() || `${cleanUsername}@seagullprinters.com`,
      role: newRole,
      roleName: roleNameMap[newRole],
      mustChangePassword: true, // Forces first-time password change!
      createdAt: new Date().toISOString().split('T')[0],
    };

    setUsers(prev => [...prev, createdUser]);
    setUserCreationSuccess(`User "${cleanUsername}" created successfully with initial password "${newInitialPassword}". They will be prompted to set a permanent password upon first login.`);
    
    // Reset form
    setNewUsername('');
    setNewFullName('');
    setNewEmail('');
    setNewInitialPassword('Seagull2026!');
  };

  // Staff / Manager Request Password Reset (Logged for Admin only)
  const handleRequestPasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotModalMessage(null);
    const search = forgotUsernameInput.trim().toLowerCase();
    const user = users.find(u => u.username.toLowerCase() === search || u.email.toLowerCase() === search);

    if (!user) {
      setForgotModalMessage({
        type: 'error',
        text: `No account found for "${forgotUsernameInput}". Please check username spelling or speak directly with the System Administrator.`
      });
      return;
    }

    if (user.role === 'ROLE_ADMIN') {
      setForgotModalMessage({
        type: 'error',
        text: 'Administrator credentials cannot be reset via staff self-service.'
      });
      return;
    }

    if (resetRequests.some(r => r.userId === user.id)) {
      setForgotModalMessage({
        type: 'success',
        text: `A reset request for ${user.fullName} (@${user.username}) is already waiting for Administrator authorization.`
      });
      return;
    }

    const newReq: PasswordResetRequest = {
      id: Date.now(),
      userId: user.id,
      username: user.username,
      fullName: user.fullName,
      roleName: user.roleName,
      requestedAt: 'Just now',
      reason: forgotReasonInput.trim() || 'Forgotten password reported by user',
    };

    setResetRequests(prev => [newReq, ...prev]);
    setForgotModalMessage({
      type: 'success',
      text: `Reset request logged successfully! Under Seagull Printers security compliance, only the System Administrator has permission to reset passwords. Please contact your Admin to receive your temporary password.`
    });
    setForgotReasonInput('');
  };

  // Admin executes password reset for a Manager or Staff member
  const handleAdminExecuteReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser) return;

    if (!adminTempResetPassword || adminTempResetPassword.length < 4) {
      return;
    }

    // Update user in users state
    setUsers(prev => prev.map(u => {
      if (u.id === resetTargetUser.id) {
        return {
          ...u,
          password: adminTempResetPassword,
          mustChangePassword: true, // Forces mandatory change upon their next login!
        };
      }
      return u;
    }));

    // Remove any pending reset request for this user
    setResetRequests(prev => prev.filter(r => r.userId !== resetTargetUser.id));

    setAdminResetSuccessMessage(
      `Password for ${resetTargetUser.fullName} (@${resetTargetUser.username}) has been successfully reset to temporary password "${adminTempResetPassword}". The user must set their new permanent password when logging in.`
    );

    setResetTargetUser(null);
    setAdminTempResetPassword('SeagullReset2026!');
  };

  // Product Catalog Handlers (Create & Edit)
  const handleOpenNewProductModal = () => {
    setEditingProduct(null);
    const nextId = simProducts.length > 0 ? Math.max(...simProducts.map(p => p.id)) + 1 : 1;
    setProductCodeInput(`PRD-${100 + nextId}`);
    setProductNameInput('Custom Visiting Cards (Pack of 500)');
    setProductCategoryInput('Visiting Cards & Stationery');
    setProductCostInput(8.20);
    setProductPriceInput(25.00);
    setProductDescInput('500 Business cards, 90x54mm, 350gsm silk board, double-sided CMYK with velvety matte lamination');
    setShowProductModal(true);
  };

  const handleOpenEditProductModal = (product: any) => {
    setEditingProduct(product);
    setProductCodeInput(product.code);
    setProductNameInput(product.name);
    setProductCategoryInput(product.category);
    setProductCostInput(product.cost);
    setProductPriceInput(product.price);
    setProductDescInput(product.description || '');
    setShowProductModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productNameInput.trim()) return;

    if (editingProduct) {
      setSimProducts(prev => prev.map(p => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            name: productNameInput.trim(),
            category: productCategoryInput,
            cost: Number(productCostInput) || 0,
            price: Number(productPriceInput) || 0,
            description: productDescInput.trim()
          };
        }
        return p;
      }));
      setProductMessage(`Product "${editingProduct.code}" updated successfully with selling price $${Number(productPriceInput).toFixed(2)}!`);
    } else {
      const nextId = simProducts.length > 0 ? Math.max(...simProducts.map(p => p.id)) + 1 : 1;
      const newProduct = {
        id: nextId,
        code: productCodeInput.trim() || `PRD-${100 + nextId}`,
        name: productNameInput.trim(),
        category: productCategoryInput,
        cost: Number(productCostInput) || 0,
        price: Number(productPriceInput) || 0,
        active: true,
        description: productDescInput.trim()
      };
      setSimProducts(prev => [...prev, newProduct]);
      setProductMessage(`New product "${newProduct.name}" (${newProduct.code}) added successfully at $${newProduct.price.toFixed(2)} selling price!`);
    }
    setShowProductModal(false);
  };

  // Machine Production Run Handlers
  const handleOpenNewRunModal = () => {
    const nextNum = simProductionRuns.length + 1;
    setNewRunOrderCode(`PROD-2024-00${nextNum}`);
    setNewRunBatch(`BATCH-VIS-0${nextNum}`);
    setNewRunProductId(3); // Default to Visiting Cards Pack of 500
    setNewRunTotalQty(500);
    setNewRunRejectedQty(15);
    setNewRunHours(1.5);
    setNewRunRate(40.0);
    setNewRunDate('2026-10-20');
    setNewRunStatus('IN_PROGRESS');
    setNewRunNotes('Order #VIS-500: Client design approved. Running 500 cards based on approved sample proof.');
    setShowNewRunModal(true);
  };

  const handleSaveProductionRun = (e: React.FormEvent) => {
    e.preventDefault();
    const product = simProducts.find(p => p.id === Number(newRunProductId));
    const netGood = Math.max(0, newRunTotalQty - newRunRejectedQty);
    const cost = Number((newRunHours * newRunRate).toFixed(2));

    const newRun = {
      id: Date.now(),
      orderCode: newRunOrderCode.trim() || `PROD-2024-00${simProductionRuns.length + 1}`,
      productId: Number(newRunProductId),
      productName: product ? product.name : 'Custom Visiting Cards (Pack of 500)',
      machineName: newRunMachineName.trim() || 'Heidelberg Printmaster / Digital Press',
      batchNumber: newRunBatch.trim() || `BATCH-${Date.now().toString().slice(-4)}`,
      quantityProduced: Number(newRunTotalQty) || 500,
      quantityRejected: Number(newRunRejectedQty) || 0,
      netGoodQuantity: netGood,
      machineHours: Number(newRunHours) || 1.5,
      machineHourlyRate: Number(newRunRate) || 40.0,
      machineCost: cost,
      productionDate: newRunDate,
      status: newRunStatus,
      notes: newRunNotes.trim()
    };

    setSimProductionRuns(prev => [newRun, ...prev]);

    // Sync into active simulation controls so user sees it right away
    setProdBatch(newRun.batchNumber);
    setProdMachineName(newRun.machineName);
    setProdTotalQty(newRun.quantityProduced);
    setProdRejectedQty(newRun.quantityRejected);
    setMachineHours(newRun.machineHours);
    setMachineRate(newRun.machineHourlyRate);
    setProdNotes(newRun.notes);

    setRunSuccessMsg(`New production run "${newRun.orderCode}" on ${newRun.machineName} (${newRun.productName}) has been successfully created and loaded into machine simulator!`);
    setShowNewRunModal(false);
  };

  const handleLoadRunIntoSimulator = (run: any) => {
    setProdBatch(run.batchNumber);
    setProdMachineName(run.machineName || 'Heidelberg Printmaster / Digital Press');
    setProdTotalQty(run.quantityProduced);
    setProdRejectedQty(run.quantityRejected);
    setMachineHours(run.machineHours);
    setMachineRate(run.machineHourlyRate);
    setProdNotes(run.notes);
    setRunSuccessMsg(`Loaded Production Run "${run.orderCode}" on ${run.machineName || 'Heidelberg Printmaster / Digital Press'} into active simulator.`);
  };

  // Labour Cost Handlers & Standard Workshop Rate Presets
  const handleOpenNewLabourModal = () => {
    const nextNum = simLabourRecords.length + 1;
    setNewLabourCode(`LBR-100${nextNum}`);
    setNewLabourDesc('Press Operation & Printing');
    setNewLabourProdCode('PROD-2024-002');
    setNewLabourWorkers(1);
    setNewLabourHours(1.0);
    setNewLabourRate(22.0);
    setNewLabourDate(new Date().toISOString().split('T')[0]);
    setNewLabourNotes('Preset standard workshop rate: 1 Worker × 1.0 hr @ $22.00 = $22.00');
    setShowLabourModal(true);
  };

  const handleApplyPressRate = () => {
    setLabourWorkers(1);
    setLabourHours(1.0);
    setLabourRate(22.0);
    setLabourSuccessMsg('Preset Applied: Press Operation & Printing (1 Worker × 1.0 hr @ $22.00/hr = $22.00).');
    triggerPopupMessage(
      'Standard Workshop Rate Applied',
      'Press Operation & Printing: 1 Worker × 1.0 hr @ $22.00 = $22.00 labour cost computed.',
      'success'
    );
  };

  const handleApplyTrimmingRate = () => {
    setLabourWorkers(1);
    setLabourHours(0.5);
    setLabourRate(16.0);
    setLabourSuccessMsg('Preset Applied: Guillotine Trimming, Packing & Inspection (1 Worker × 0.5 hr @ $16.00/hr = $8.00).');
    triggerPopupMessage(
      'Standard Workshop Rate Applied',
      'Guillotine Trimming, Packing & Inspection: 1 Worker × 0.5 hr @ $16.00/hr = $8.00 labour cost computed.',
      'success'
    );
  };

  const handleApplyCombinedRates = () => {
    setLabourWorkers(1);
    setLabourHours(1.5);
    setLabourRate(20.0);
    setLabourSuccessMsg('Standard Workshop Rates: Total Labour Cost auto-calculated as $30.00 ($22.00 Press + $8.00 Guillotine).');
    triggerPopupMessage(
      'Workshop Rates Auto-Calculated',
      'Total Labour Cost: Auto-calculated as $30.00 ($22.00 Press Operation + $8.00 Guillotine Trimming).',
      'success'
    );
  };

  const handleBatchRecordStandardLabour = () => {
    const today = new Date().toISOString().split('T')[0];
    const pressRecord = {
      id: Date.now(),
      code: `LBR-100${simLabourRecords.length + 1}`,
      description: 'Press Operation & Printing',
      productionCode: 'PROD-2024-002',
      workers: 1,
      hours: 1.0,
      rate: 22.00,
      totalCost: 22.00,
      date: today,
      notes: 'Preset standard workshop rate: 1 Worker × 1.0 hr @ $22.00 = $22.00'
    };
    const trimmingRecord = {
      id: Date.now() + 1,
      code: `LBR-100${simLabourRecords.length + 2}`,
      description: 'Guillotine Trimming, Packing & Inspection',
      productionCode: 'PROD-2024-002',
      workers: 1,
      hours: 0.5,
      rate: 16.00,
      totalCost: 8.00,
      date: today,
      notes: 'Preset standard workshop rate: 1 Worker × 0.5 hr @ $16.00/hr = $8.00'
    };

    setSimLabourRecords(prev => [pressRecord, trimmingRecord, ...prev]);
    setLabourWorkers(1);
    setLabourHours(1.5);
    setLabourRate(20.0);
    setLabourSuccessMsg('Recorded standard workshop rates: Press Operation ($22.00) + Guillotine Trimming ($8.00) = $30.00 Total Labour Cost auto-calculated!');
    triggerPopupMessage(
      'Labour Records & Total Updated',
      'Standard workshop rates auto-calculated and recorded: Press Operation ($22.00) + Guillotine Trimming ($8.00) = $30.00 Total Labour Cost.',
      'success'
    );
  };

  const handleUpdateLabourInfo = () => {
    setLabourSuccessMsg(`Labour cost updated: ${labourWorkers} workers × ${labourHours} hrs @ $${labourRate.toFixed(2)}/hr = $${totalLabourCalculated.toFixed(2)}.`);
    triggerPopupMessage(
      'Labour Information Updated',
      `Auto-computed: ${labourWorkers} worker(s) × ${labourHours} hrs @ $${labourRate.toFixed(2)}/hr. Total Labour Cost is $${totalLabourCalculated.toFixed(2)}.`,
      'success'
    );
  };

  const handleSelectModalLabourPreset = (preset: 'press' | 'guillotine' | 'combined') => {
    if (preset === 'press') {
      setNewLabourDesc('Press Operation & Printing');
      setNewLabourWorkers(1);
      setNewLabourHours(1.0);
      setNewLabourRate(22.0);
      setNewLabourNotes('Preset standard workshop rate: 1 Worker × 1.0 hr @ $22.00 = $22.00');
    } else if (preset === 'guillotine') {
      setNewLabourDesc('Guillotine Trimming, Packing & Inspection');
      setNewLabourWorkers(1);
      setNewLabourHours(0.5);
      setNewLabourRate(16.0);
      setNewLabourNotes('Preset standard workshop rate: 1 Worker × 0.5 hr @ $16.00/hr = $8.00');
    } else {
      setNewLabourDesc('Standard Workshop Labour Package (Press Operation + Guillotine Trimming)');
      setNewLabourWorkers(1);
      setNewLabourHours(1.5);
      setNewLabourRate(20.0);
      setNewLabourNotes('Total Labour Cost: Auto-calculated as $30.00 ($22.00 Press + $8.00 Guillotine)');
    }
  };

  const handleSaveLabourCost = (e: React.FormEvent) => {
    e.preventDefault();
    const calculatedCost = Number((newLabourWorkers * newLabourHours * newLabourRate).toFixed(2));
    const newRecord = {
      id: Date.now(),
      code: newLabourCode.trim() || `LBR-${Date.now().toString().slice(-4)}`,
      description: newLabourDesc.trim() || 'Production labour work',
      productionCode: newLabourProdCode,
      workers: Number(newLabourWorkers) || 1,
      hours: Number(newLabourHours) || 0,
      rate: Number(newLabourRate) || 0,
      totalCost: calculatedCost,
      date: newLabourDate,
      notes: newLabourNotes.trim()
    };
    setSimLabourRecords(prev => [newRecord, ...prev]);
    setLabourWorkers(newRecord.workers);
    setLabourHours(newRecord.hours);
    setLabourRate(newRecord.rate);
    setLabourSuccessMsg(`Labour cost "${newRecord.code}" ($${calculatedCost.toFixed(2)}) recorded successfully and loaded into calculator!`);
    triggerPopupMessage(
      'Labour Cost Recorded',
      `Labour record "${newRecord.code}" (${newRecord.description}) saved successfully. Total: $${calculatedCost.toFixed(2)}.`,
      'success'
    );
    setShowLabourModal(false);
  };

  const handleLoadLabourIntoCalculator = (record: any) => {
    setLabourWorkers(record.workers);
    setLabourHours(record.hours);
    setLabourRate(record.rate);
    setLabourSuccessMsg(`Loaded Labour Record "${record.code}" (${record.description}) into calculator.`);
    triggerPopupMessage(
      'Labour Record Loaded',
      `Loaded "${record.code}" (${record.description}): ${record.workers} worker(s) × ${record.hours} hrs @ $${record.rate.toFixed(2)}/hr = $${record.totalCost.toFixed(2)}.`,
      'info'
    );
  };

  // Other Expenses Handlers & Standard Overheads Presets
  const handleOpenNewExpenseModal = () => {
    const nextNum = simExpenseRecords.length + 1;
    setNewExpenseCode(`EXP-500${nextNum}`);
    setNewExpenseType('Packaging');
    setNewExpenseDesc('Visiting Card Acrylic / Cardboard Box');
    setNewExpenseProdCode('PROD-2024-002');
    setNewExpenseQuantity(1.0);
    setNewExpenseUnitPrice(1.50);
    setNewExpenseDate(new Date().toISOString().split('T')[0]);
    setShowExpenseModal(true);
  };

  const handleApplyBoxOverhead = () => {
    setExpenseQty(1.0);
    setExpenseUnitPrice(1.50);
    setExpenseSuccessMsg('Preset Applied: Visiting Card Acrylic / Cardboard Box (1 unit × $1.50 = $1.50).');
    triggerPopupMessage(
      'Standard Overhead Applied',
      'Visiting Card Acrylic / Cardboard Box: 1 unit × $1.50 = $1.50 overhead computed.',
      'success'
    );
  };

  const handleApplyCourierOverhead = () => {
    setExpenseQty(1.0);
    setExpenseUnitPrice(5.00);
    setExpenseSuccessMsg('Preset Applied: Local Courier / Delivery (1 delivery × $5.00 = $5.00).');
    triggerPopupMessage(
      'Standard Overhead Applied',
      'Local Courier / Delivery: 1 delivery × $5.00 = $5.00 overhead computed.',
      'success'
    );
  };

  const handleApplyCombinedOverheads = () => {
    setExpenseQty(1.0);
    setExpenseUnitPrice(6.50);
    setExpenseSuccessMsg('Standard Overheads Computed: Total Other Overheads auto-calculated as $6.50 ($1.50 Box + $5.00 Delivery).');
    triggerPopupMessage(
      'Overheads Auto-Calculated',
      'Total Other Overheads: Auto-calculated as $6.50 ($1.50 Acrylic/Cardboard Box + $5.00 Local Delivery).',
      'success'
    );
  };

  const handleBatchRecordStandardOverheads = () => {
    const today = new Date().toISOString().split('T')[0];
    const boxExp = {
      id: Date.now(),
      code: `EXP-500${simExpenseRecords.length + 1}`,
      type: 'Packaging',
      description: 'Visiting Card Acrylic / Cardboard Box',
      productionCode: 'PROD-2024-002',
      quantity: 1.0,
      unitPrice: 1.50,
      totalCost: 1.50,
      date: today
    };
    const courierExp = {
      id: Date.now() + 1,
      code: `EXP-500${simExpenseRecords.length + 2}`,
      type: 'Transport',
      description: 'Local Courier / Delivery',
      productionCode: 'PROD-2024-002',
      quantity: 1.0,
      unitPrice: 5.00,
      totalCost: 5.00,
      date: today
    };

    setSimExpenseRecords(prev => [boxExp, courierExp, ...prev]);
    setExpenseQty(1.0);
    setExpenseUnitPrice(6.50);
    setExpenseSuccessMsg('Recorded standard overheads: Acrylic/Cardboard Box ($1.50) + Local Delivery ($5.00) = $6.50 Total Overheads auto-calculated!');
    triggerPopupMessage(
      'Overheads Recorded & Total Updated',
      'Recorded standard overheads: Visiting Card Box ($1.50) + Local Courier/Delivery ($5.00) = $6.50 Total Other Overheads auto-calculated.',
      'success'
    );
  };

  const handleUpdateExpenseInfo = () => {
    setExpenseSuccessMsg(`Expense computation updated: ${expenseQty} units @ $${expenseUnitPrice.toFixed(2)} = $${totalExpense.toFixed(2)}.`);
    triggerPopupMessage(
      'Expense Information Updated',
      `Auto-computed: ${expenseQty} unit(s) @ $${expenseUnitPrice.toFixed(2)} = $${totalExpense.toFixed(2)} total expense overhead.`,
      'success'
    );
  };

  const handleSelectModalExpensePreset = (preset: 'box' | 'courier' | 'combined') => {
    if (preset === 'box') {
      setNewExpenseType('Packaging');
      setNewExpenseDesc('Visiting Card Acrylic / Cardboard Box');
      setNewExpenseQuantity(1.0);
      setNewExpenseUnitPrice(1.50);
    } else if (preset === 'courier') {
      setNewExpenseType('Transport');
      setNewExpenseDesc('Local Courier / Delivery');
      setNewExpenseQuantity(1.0);
      setNewExpenseUnitPrice(5.00);
    } else {
      setNewExpenseType('Packaging');
      setNewExpenseDesc('Visiting Card Complete Overheads: Acrylic/Cardboard Box + Local Delivery');
      setNewExpenseQuantity(1.0);
      setNewExpenseUnitPrice(6.50);
    }
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const calculatedAmount = Number((newExpenseQuantity * newExpenseUnitPrice).toFixed(2));
    const newExpense = {
      id: Date.now(),
      code: newExpenseCode.trim() || `EXP-${Date.now().toString().slice(-4)}`,
      type: newExpenseType,
      description: newExpenseDesc.trim() || 'General production expense',
      productionCode: newExpenseProdCode,
      quantity: Number(newExpenseQuantity) || 1,
      unitPrice: Number(newExpenseUnitPrice) || 0,
      totalCost: calculatedAmount,
      date: newExpenseDate
    };
    setSimExpenseRecords(prev => [newExpense, ...prev]);
    setExpenseQty(newExpense.quantity);
    setExpenseUnitPrice(newExpense.unitPrice);
    setExpenseSuccessMsg(`Expense "${newExpense.code}" ($${calculatedAmount.toFixed(2)}) recorded successfully and loaded into calculator!`);
    triggerPopupMessage(
      'Expense Recorded',
      `Expense "${newExpense.code}" (${newExpense.type}: ${newExpense.description}) recorded successfully. Total: $${calculatedAmount.toFixed(2)}.`,
      'success'
    );
    setShowExpenseModal(false);
  };

  const handleLoadExpenseIntoCalculator = (exp: any) => {
    setExpenseQty(exp.quantity);
    setExpenseUnitPrice(exp.unitPrice);
    setExpenseSuccessMsg(`Loaded Expense "${exp.code}" (${exp.description}) into calculator.`);
    triggerPopupMessage(
      'Expense Loaded',
      `Loaded "${exp.code}" (${exp.description}): ${exp.quantity} @ $${exp.unitPrice.toFixed(2)} = $${exp.totalCost.toFixed(2)}.`,
      'info'
    );
  };

  // Cost & Profit Analysis Handlers & Sales Invoicing
  const handleOpenNewAnalysisModal = () => {
    const nextNum = simAnalysisRecords.length + 1;
    setNewAnaCode(`ANA-2024-00${nextNum}`);
    setNewAnaProdCode('PROD-2024-002');
    setNewAnaMatCost(54.70); // 25 sheets Silk Board ($9.50) + 4 plates ($27.20) + 0.2 roll film ($13.00) + Ink ($5.00)
    setNewAnaLabCost(30.00); // 1.0 hr press ($22) + 0.5 hr trimming ($8) = $30.00
    setNewAnaMachCost(25.76); // Heidelberg Printmaster setup & run = $25.76
    setNewAnaExpCost(6.50); // Acrylic box ($1.50) + Local courier ($5.00) = $6.50
    setNewAnaProducedQty(500);
    setNewAnaSellingPrice(0.36); // $180.00 / 500 cards = $0.36/card
    setNewAnaSoldQty(500);
    setShowAnalysisModal(true);
  };

  const handleLoadVis500SalesAndInvoicing = () => {
    setAnalysisMatCost(54.70);
    setAnalysisLabCost(30.00);
    setAnalysisMachCost(25.76);
    setAnalysisExpCost(6.50);
    setAnalysisUnitsProduced(500);
    setAnalysisActualSold(500);
    setAnalysisSellingPrice(0.36);
    setAnalysisSalesRecorded(true);
    setAnalysisSuccessMsg('Loaded Order #VIS-500: 500 Cards sold @ $0.36/card ($180.00 Invoiced). COGS: $116.96, Net Realized Profit: $63.04 (35.02% margin).');
    triggerPopupMessage(
      'Sales & Invoicing Loaded',
      'Order #VIS-500: 500 Cards invoiced at $180.00 ($0.36/card). COGS: $116.96, Net Profit: $63.04, Margin: 35.02%.',
      'success'
    );
  };

  const handleSaveAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    const totalC = Number((newAnaMatCost + newAnaLabCost + newAnaMachCost + newAnaExpCost).toFixed(2));
    const unitC = newAnaProducedQty > 0 ? Number((totalC / newAnaProducedQty).toFixed(4)) : 0;
    const rev = Number((newAnaSoldQty * newAnaSellingPrice).toFixed(2));
    const cog = Number((unitC * newAnaSoldQty).toFixed(2));
    const prof = Number((rev - cog).toFixed(2));
    const margin = rev > 0 ? Number(((prof / rev) * 100).toFixed(2)) : 0;
    const prodRun = simProductionRuns.find(r => r.orderCode === newAnaProdCode);

    const newAnalysis = {
      id: Date.now(),
      code: newAnaCode.trim() || `ANA-${Date.now().toString().slice(-4)}`,
      productionCode: newAnaProdCode,
      productName: prodRun ? prodRun.productName : 'Custom Visiting Cards (Pack of 500)',
      rawMaterialCost: Number(newAnaMatCost) || 0,
      labourCost: Number(newAnaLabCost) || 0,
      machineCost: Number(newAnaMachCost) || 0,
      otherExpenseCost: Number(newAnaExpCost) || 0,
      totalCost: totalC,
      producedQty: Number(newAnaProducedQty) || 1,
      costPerUnit: unitC,
      actualSoldQty: Number(newAnaSoldQty) || 0,
      sellingPrice: Number(newAnaSellingPrice) || 0,
      revenue: rev,
      cogs: cog,
      profit: prof,
      profitMarginPct: margin,
      date: new Date().toISOString().split('T')[0]
    };

    setSimAnalysisRecords(prev => [newAnalysis, ...prev]);

    setAnalysisMatCost(newAnalysis.rawMaterialCost);
    setAnalysisLabCost(newAnalysis.labourCost);
    setAnalysisMachCost(newAnalysis.machineCost);
    setAnalysisExpCost(newAnalysis.otherExpenseCost);
    setAnalysisUnitsProduced(newAnalysis.producedQty);
    setAnalysisSellingPrice(newAnalysis.sellingPrice);
    setAnalysisActualSold(newAnalysis.actualSoldQty);
    setAnalysisSalesRecorded(true);

    setAnalysisSuccessMsg(`Cost & Profit Analysis "${newAnalysis.code}" generated successfully! Realized Profit: $${prof.toFixed(2)} (${margin}% margin).`);
    setShowAnalysisModal(false);
    triggerPopupMessage(
      'Analysis & Invoicing Saved',
      `Analysis "${newAnalysis.code}" saved: Revenue $${rev.toFixed(2)}, COGS $${cog.toFixed(2)}, Net Realized Profit $${prof.toFixed(2)} (${margin.toFixed(2)}% margin).`,
      'success'
    );
  };

  const handleLoadAnalysisIntoEngine = (ana: any) => {
    setAnalysisMatCost(ana.rawMaterialCost);
    setAnalysisLabCost(ana.labourCost);
    setAnalysisMachCost(ana.machineCost);
    setAnalysisExpCost(ana.otherExpenseCost);
    setAnalysisUnitsProduced(ana.producedQty);
    setAnalysisSellingPrice(ana.sellingPrice);
    setAnalysisActualSold(ana.actualSoldQty);
    setAnalysisSalesRecorded(true);
    setAnalysisSuccessMsg(`Loaded Analysis "${ana.code}" (${ana.productName}) into analysis engine.`);
    triggerPopupMessage(
      'Analysis Loaded',
      `Loaded "${ana.code}": Revenue $${ana.revenue.toFixed(2)}, COGS $${ana.cogs.toFixed(2)}, Net Realized Profit $${ana.profit.toFixed(2)} (${ana.profitMarginPct.toFixed(2)}% margin).`,
      'info'
    );
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginError('');
    setLoginSuccess('');
    setLoginPassword(''); // Password must always be entered by user
    setForcePasswordUser(null);
  };

  // Role Permissions
  const canAccessCostAnalysis = currentUser?.role === 'ROLE_ADMIN' || currentUser?.role === 'ROLE_MANAGER';
  const canAccessUserSecurity = currentUser?.role === 'ROLE_ADMIN';
  const canManageProducts = currentUser?.role === 'ROLE_ADMIN' || currentUser?.role === 'ROLE_MANAGER';

  // Navigation Items allowed for current user role
  const availableModules = useMemo(() => {
    if (!currentUser) return [];

    const items = [
      { id: 'dashboard', name: 'Dashboard', icon: BarChart3, roles: ['ROLE_ADMIN', 'ROLE_MANAGER'] },
      { id: 'products', name: 'Product Catalog', icon: Box, roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_PRODUCTION_STAFF'] },
      { id: 'materials', name: 'Raw Materials & Stock', icon: Layers, roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_PRODUCTION_STAFF'] },
      { id: 'machines', name: 'Machine Production', icon: Cpu, roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_PRODUCTION_STAFF'] },
      { id: 'labour', name: 'Labour Costs', icon: Users, roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_PRODUCTION_STAFF'] },
      { id: 'expenses', name: 'Other Expenses', icon: DollarSign, roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_PRODUCTION_STAFF'] },
      { id: 'analysis', name: 'Cost Analysis & Invoicing', icon: Sparkles, roles: ['ROLE_ADMIN', 'ROLE_MANAGER'] },
      { id: 'roles', name: 'User Security', icon: ShieldCheck, roles: ['ROLE_ADMIN'] },
    ];

    return items.filter(item => item.roles.includes(currentUser.role));
  }, [currentUser]);

  // ================= SCENARIO 1: MANDATORY FIRST-TIME PASSWORD CHANGE SCREEN =================
  if (forcePasswordUser) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center px-4 py-8 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center text-amber-600 shadow-xs mb-3">
              <KeyRound className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">First-Time Login</h2>
            <p className="text-xs text-slate-500 mt-1">
              Welcome, <strong className="text-slate-800">{forcePasswordUser.fullName}</strong>! An administrator created your account with a temporary initial password. Please set your permanent password to continue.
            </p>
          </div>

          {passwordChangeError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{passwordChangeError}</span>
            </div>
          )}

          <form onSubmit={handleFirstTimePasswordChange} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Username (Given by Admin)</label>
              <input
                type="text"
                value={forcePasswordUser.username}
                disabled
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-600 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">New Permanent Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new secure password"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20"
                required
                autoFocus
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Minimum 6 characters.</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm transition shadow-xs flex items-center justify-center space-x-2"
            >
              <span>Save Password & Access System</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setForcePasswordUser(null)}
              className="text-xs text-slate-400 hover:text-slate-600 underline"
            >
              Cancel & Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= SCENARIO 2: LOGIN PAGE =================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center px-4 py-8 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-2xl p-2.5 flex items-center justify-center text-slate-900 shadow-xs mb-3">
              <SeagullLogo className="w-full h-full text-slate-900" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Seagull Printers</h1>
            <p className="text-xs text-slate-500 mt-1">Production Cost Analysis & Stock Management System</p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {loginSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{loginSuccess}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Username</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Enter assigned username"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20"
                required
                autoFocus
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="text-[11px] text-sky-600 hover:text-sky-700 inline-flex items-center space-x-1"
                >
                  {showLoginPassword ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Show</span>
                    </>
                  )}
                </button>
              </div>
              <input
                type={showLoginPassword ? 'text' : 'password'}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20"
                required
              />
              <div className="flex items-center justify-between mt-1 text-[11px]">
                <span className="text-slate-500">Password must be entered by user.</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true);
                    setForgotUsernameInput(loginUsername || '');
                    setForgotModalMessage(null);
                  }}
                  className="text-amber-700 hover:text-amber-800 font-semibold underline transition cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm transition shadow-xs flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isAuthenticating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to System</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Username Select (Fills Username Only - Password Must Be Entered by User) */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-1">
              Select Role / Username
            </div>
            <p className="text-[11px] text-slate-400 text-center mb-2.5">
              Select an account to auto-fill the username, then type your password above.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setLoginUsername('admin');
                  setLoginPassword('');
                  setLoginError('');
                }}
                className={`p-2.5 border rounded-xl text-center transition ${
                  loginUsername === 'admin' 
                    ? 'bg-rose-50 border-rose-300 text-rose-800 ring-2 ring-rose-200' 
                    : 'bg-slate-50 hover:bg-sky-50 text-slate-800 border-slate-200 hover:border-sky-300'
                }`}
                title="Select Admin username"
              >
                <div className="font-bold text-xs text-rose-700">Admin</div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-mono">admin</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginUsername('manager');
                  setLoginPassword('');
                  setLoginError('');
                }}
                className={`p-2.5 border rounded-xl text-center transition ${
                  loginUsername === 'manager' 
                    ? 'bg-amber-50 border-amber-300 text-amber-800 ring-2 ring-amber-200' 
                    : 'bg-slate-50 hover:bg-sky-50 text-slate-800 border-slate-200 hover:border-sky-300'
                }`}
                title="Select Manager username"
              >
                <div className="font-bold text-xs text-amber-700">Manager</div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-mono">manager</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginUsername('staff');
                  setLoginPassword('');
                  setLoginError('');
                }}
                className={`p-2.5 border rounded-xl text-center transition ${
                  loginUsername === 'staff' 
                    ? 'bg-sky-50 border-sky-300 text-sky-800 ring-2 ring-sky-200' 
                    : 'bg-slate-50 hover:bg-sky-50 text-slate-800 border-slate-200 hover:border-sky-300'
                }`}
                title="Select Staff username"
              >
                <div className="font-bold text-xs text-sky-700">Staff</div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-mono">staff</div>
              </button>
            </div>
          </div>
        </div>

        {/* Forgot Password Request Modal (Only Admin Can Reset) */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Forgot Password Assistance</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Policy Banner: Admin Only Permission */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs mb-4 flex items-start space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-950 font-bold mb-0.5">Admin Permission Required:</strong>
                  Under Seagull Printers security guidelines, Manager and Staff cannot reset passwords self-service. Only the <strong>System Administrator</strong> has the permission to issue a temporary password reset.
                </div>
              </div>

              {forgotModalMessage && (
                <div className={`p-3 rounded-xl text-xs mb-4 flex items-start space-x-2 ${
                  forgotModalMessage.type === 'success' 
                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-900' 
                    : 'bg-rose-50 border border-rose-300 text-rose-900'
                }`}>
                  {forgotModalMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{forgotModalMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleRequestPasswordReset} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Your Username or Registered Email *</label>
                  <input
                    type="text"
                    value={forgotUsernameInput}
                    onChange={(e) => setForgotUsernameInput(e.target.value)}
                    placeholder="e.g. manager or staff"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Reason / Note for Administrator (Optional)</label>
                  <textarea
                    value={forgotReasonInput}
                    onChange={(e) => setForgotReasonInput(e.target.value)}
                    placeholder="e.g. Forgot password after weekend shift..."
                    rows={2}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Notify Administrator</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ================= SCENARIO 3: AUTHENTICATED APPLICATION =================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Real-Time Popup Message Bar / Notification Toast */}
      {popupToast && (
        <aside aria-label="Notifications" className="fixed top-5 right-4 sm:right-6 z-[9999] max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-300 drop-shadow-2xl">
          <div className="bg-slate-900/95 text-white rounded-2xl p-4 border border-slate-700/80 flex items-start space-x-3.5 backdrop-blur-md shadow-2xl ring-1 ring-white/10">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
              popupToast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
              popupToast.type === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
              'bg-sky-500/20 text-sky-400 border border-sky-500/40'
            }`}>
              {popupToast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>{popupToast.title}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">{popupToast.timestamp}</span>
              </div>
              <p className="text-xs text-slate-100 font-medium mt-1 leading-relaxed">{popupToast.message}</p>
              <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5">
                <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                  <Check className="w-3 h-3" />
                  <span>Information Updated in System</span>
                </span>
                <span className="text-slate-400">Auto-dismiss 6s</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPopupToast(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer transition hover:bg-slate-800 shrink-0"
              title="Dismiss message"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* Top Application Header Bar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo & Company Name */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 bg-white border border-slate-200 rounded-xl p-1.5 flex items-center justify-center text-slate-900 shadow-xs">
              <SeagullLogo className="w-full h-full text-slate-900" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-lg tracking-tight leading-tight">Seagull Printers</h1>
              <p className="text-xs text-slate-500">Production Cost Analysis & Stock Management System</p>
            </div>
          </div>

          {/* User Profile, Role Badge, Download ZIP & Sign Out */}
          <div className="flex items-center space-x-3">
            {/* Logged in User Badge */}
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="font-semibold text-slate-800">{currentUser.fullName}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                currentUser.role === 'ROLE_ADMIN' 
                  ? 'bg-rose-100 text-rose-800' 
                  : currentUser.role === 'ROLE_MANAGER' 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'bg-sky-100 text-sky-800'
              }`}>
                {currentUser.role === 'ROLE_ADMIN' ? 'ADMIN' : currentUser.role === 'ROLE_MANAGER' ? 'MANAGER' : 'STAFF'}
              </span>
            </div>

            {/* Download Full Project ZIP */}
            <a
              href="/Seagull_Printers_Production_Cost_System.zip"
              download="Seagull_Printers_Production_Cost_System.zip"
              className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-medium text-xs border border-slate-200 transition"
              title="Download Seagull_Printers_Production_Cost_System.zip"
            >
              <Download className="w-3.5 h-3.5 text-sky-600" />
              <span>Project ZIP</span>
            </a>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-semibold border border-slate-200 hover:border-rose-200 transition"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Clean Application Navigation Tabs (Role Filtered) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto space-x-1 border-t border-slate-100 pt-1 pb-1">
          {availableModules.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id as any)}
                className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Module 1: Dashboard View (Admin & Manager) */}
        {activeModule === 'dashboard' && (
          <div className="space-y-6">
            {/* Low Stock Alert */}
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start space-x-3 text-amber-900 shadow-xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="font-bold text-amber-900">Automated Inventory Warning:</span> 2 raw materials (
                <span className="font-semibold underline">Silk Board 350gsm</span> and{' '}
                <span className="font-semibold underline">Thermal CTP Plates</span>) have dropped below minimum threshold limits!
                <button
                  onClick={() => setActiveModule('materials')}
                  className="ml-2 text-sky-700 hover:text-sky-800 font-bold underline"
                >
                  View Raw Materials &rarr;
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border-l-4 border-l-sky-500 border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="text-xs uppercase text-slate-500 font-bold tracking-wider">Active Products</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{simProducts.length} Catalog Items</div>
                <div className="text-xs text-sky-600 font-medium mt-1">Standard cost & price models</div>
              </div>
              <div className="bg-white border-l-4 border-l-emerald-500 border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="text-xs uppercase text-slate-500 font-bold tracking-wider">Inventory Value</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">
                  ${simMaterials.reduce((sum, m) => sum + m.stock * m.price, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-emerald-600 font-medium mt-1">{simMaterials.length} raw materials tracked</div>
              </div>
              <div className="bg-white border-l-4 border-l-amber-500 border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="text-xs uppercase text-slate-500 font-bold tracking-wider">Manufactured Units</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{prodTotalQty.toLocaleString()} Units</div>
                <div className="text-xs text-rose-600 font-medium mt-1">({prodRejectedQty} rejects &bull; {netGoodQty} net good)</div>
              </div>
              <div className="bg-white border-l-4 border-l-emerald-600 border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="text-xs uppercase text-slate-500 font-bold tracking-wider">Realized Net Profit</div>
                <div className="text-2xl font-bold text-emerald-600 mt-1">
                  ${realizedProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-slate-500 mt-1">Margin: {profitMarginPct.toFixed(1)}% (Realized sales)</div>
              </div>
            </div>

            {/* Manufacturing Cost Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900">Manufacturing Cost Allocation Breakdown</h3>
                  <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2.5 py-1 rounded-md border border-slate-200">
                    Live Data Sourced
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="text-slate-700">Raw Material Consumed</span>
                      <span className="font-mono text-slate-900 font-bold">${analysisMatCost.toFixed(2)} (47.0%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-sky-600 h-full rounded-full" style={{ width: '47%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="text-slate-700">Direct Labour Wages</span>
                      <span className="font-mono text-slate-900 font-bold">${analysisLabCost.toFixed(2)} (23.7%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '23.7%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="text-slate-700">Machine Operational Cost</span>
                      <span className="font-mono text-slate-900 font-bold">${analysisMachCost.toFixed(2)} (16.6%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: '16.6%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="text-slate-700">Other Overhead Expenses</span>
                      <span className="font-mono text-slate-900 font-bold">${analysisExpCost.toFixed(2)} (12.7%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-teal-600 h-full rounded-full" style={{ width: '12.7%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Box */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 mb-3">Cost Accounting Formula</h3>
                  <div className="p-3.5 bg-slate-50 rounded-lg text-xs font-mono text-slate-700 space-y-1.5 border border-slate-200">
                    <div>Total Cost = Mat + Lab + Mach + Exp</div>
                    <div className="text-sky-700 font-bold text-sm">= ${totalProdCost.toFixed(2)}</div>
                    <div className="border-t border-slate-200 pt-1.5 mt-1.5">
                      Cost/Unit = Total / Produced Qty
                    </div>
                    <div className="text-emerald-700 font-bold text-sm">= ${costPerUnit.toFixed(4)} / unit</div>
                  </div>
                </div>
                {canAccessCostAnalysis && (
                  <button
                    onClick={() => setActiveModule('analysis')}
                    className="w-full mt-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                  >
                    Open Cost & Profit Analysis &rarr;
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Module 2: Products Catalog */}
        {activeModule === 'products' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Product Catalog Management</h3>
                <p className="text-xs text-slate-500">
                  Register print specifications, visiting cards, custom orders, baseline costs, and agreed selling prices.
                </p>
              </div>
              {canManageProducts && (
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 font-mono">
                    Auto-ID: PRD-{100 + (simProducts.length + 1)}
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenNewProductModal}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add New Product</span>
                  </button>
                </div>
              )}
            </div>

            {productMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{productMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setProductMessage(null)}
                  className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
                >
                  &times;
                </button>
              </div>
            )}

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3.5">Product Code</th>
                    <th className="py-3 px-3.5">Item Name</th>
                    <th className="py-3 px-3.5">Category</th>
                    <th className="py-3 px-3.5">Standard Cost</th>
                    <th className="py-3 px-3.5">Selling Price</th>
                    <th className="py-3 px-3.5">Status</th>
                    {canManageProducts && <th className="py-3 px-3.5 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {simProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3.5 font-mono font-bold text-sky-700">{p.code}</td>
                      <td className="py-3 px-3.5">
                        <div className="text-slate-900 font-medium">{p.name}</div>
                        {p.description && (
                          <div className="text-[11px] text-slate-500 line-clamp-1">{p.description}</div>
                        )}
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-slate-700 font-mono">${p.cost.toFixed(2)}</td>
                      <td className="py-3 px-3.5 font-bold font-mono text-emerald-700 text-sm">
                        ${p.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      </td>
                      {canManageProducts && (
                        <td className="py-3 px-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenEditProductModal(p)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 hover:border-sky-300 transition"
                            title="Edit product name, cost, or selling price"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Edit / Set Price</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Explanatory note */}
            <div className="p-3.5 bg-sky-50/60 border border-sky-200 rounded-xl text-xs text-sky-900 flex items-start space-x-2.5">
              <Box className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <strong>Visiting Cards & Custom Orders:</strong> Click <strong>+ Add New Product</strong> to register custom card jobs, or click <strong>Edit / Set Price</strong> next to <strong>PRD-103</strong> to adjust the selling price (e.g. from $22.50 to $25.00) agreed upon with your client.
              </div>
            </div>
          </div>
        )}

        {/* Product Creation / Editing Modal */}
        {showProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Box className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingProduct ? `Edit Product: ${editingProduct.code}` : 'Register New Product / Custom Job'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Product Code *</label>
                    <input
                      type="text"
                      value={productCodeInput}
                      onChange={(e) => setProductCodeInput(e.target.value)}
                      placeholder="e.g. PRD-106"
                      disabled={!!editingProduct}
                      className="w-full bg-slate-50 disabled:bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-sky-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Category *</label>
                    <select
                      value={productCategoryInput}
                      onChange={(e) => setProductCategoryInput(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                      required
                    >
                      <option value="Visiting Cards & Stationery">Visiting Cards & Stationery</option>
                      <option value="Marketing Collateral">Marketing Collateral</option>
                      <option value="Booklets & Publishing">Booklets & Publishing</option>
                      <option value="Packaging">Packaging</option>
                      <option value="Labels & Stickers">Labels & Stickers</option>
                      <option value="Custom Client Order">Custom Client Order</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Product / Job Name *</label>
                  <input
                    type="text"
                    value={productNameInput}
                    onChange={(e) => setProductNameInput(e.target.value)}
                    placeholder="e.g. Matte Finish Visiting Cards (Pack of 500)"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Standard Estimated Cost ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productCostInput}
                      onChange={(e) => setProductCostInput(parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 8.20"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Selling Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productPriceInput}
                      onChange={(e) => setProductPriceInput(parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 25.00 (agreed with client)"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-sky-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Specifications / Notes</label>
                  <textarea
                    value={productDescInput}
                    onChange={(e) => setProductDescInput(e.target.value)}
                    placeholder="e.g. 500 Cards, 90x54mm, 350gsm Silk board, double-sided CMYK with matte lamination"
                    rows={2}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center space-x-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{editingProduct ? 'Save Changes' : 'Register Product'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Module 3: Raw Materials & Stock Management */}
        {activeModule === 'materials' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Raw Material Inventory &amp; Stock Movements</h3>
                  <p className="text-xs text-slate-500">
                    Real-time stock levels, consumption deductions, waste tracking, and low-stock threshold alerts.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 font-mono">
                    {simMaterials.length} Materials
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setModalConsumeMsg(null);
                      setShowConsumptionModal(true);
                    }}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Layers className="w-4 h-4" />
                    <span>+ Record Consumption</span>
                  </button>
                </div>
              </div>

              {/* Stock Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3.5">Code</th>
                      <th className="py-3 px-3.5">Material Name</th>
                      <th className="py-3 px-3.5">Unit</th>
                      <th className="py-3 px-3.5">Unit Price</th>
                      <th className="py-3 px-3.5">Available Stock</th>
                      <th className="py-3 px-3.5">Safety Threshold</th>
                      <th className="py-3 px-3.5">Stock Condition</th>
                      <th className="py-3 px-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {simMaterials.map((m) => {
                      const isLow = m.stock <= m.minAlert;
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-3.5 font-mono font-bold text-sky-700">{m.code}</td>
                          <td className="py-3 px-3.5 text-slate-900 font-medium">{m.name}</td>
                          <td className="py-3 px-3.5 text-slate-500">{m.unit}</td>
                          <td className="py-3 px-3.5 text-slate-700 font-mono">${m.price.toFixed(2)}</td>
                          <td className="py-3 px-3.5 font-bold font-mono text-slate-900">{m.stock.toLocaleString()}</td>
                          <td className="py-3 px-3.5 text-slate-500 font-mono">{m.minAlert.toLocaleString()}</td>
                          <td className="py-3 px-3.5">
                            {isLow ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-300">
                                LOW STOCK ALERT
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                In Stock
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenConsumptionModalForMaterial(m.id)}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold transition shadow-2xs cursor-pointer inline-flex items-center space-x-1"
                            >
                              <Layers className="w-3 h-3 text-amber-600" />
                              <span>Record Consumption</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stock Deduction Form & Audit Ledger */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h4 className="font-bold text-slate-900 flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-amber-600" />
                      <span>Record Material Consumption &amp; Stock Deduction</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Deduct raw materials, track unit costs &amp; waste allowances, and log directly into <code>material_stock_movements</code>.
                    </p>
                  </div>
                  <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200 shrink-0">
                    Audit Logged
                  </span>
                </div>

                {/* Visiting Card 500 Standard Raw Material Package Presets */}
                <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50/60 rounded-xl border border-amber-200/80 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                      <span className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                        Visiting Card 500 Consumption Package (Order #VIS-500)
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-300">
                      Recipe Total: $54.70
                    </span>
                  </div>

                  <p className="text-[11px] text-amber-900/90 leading-relaxed">
                    Standard material allocation for producing 500 visiting cards (350gsm Silk Board + CMYK Plates + Matte Thermal Film + Process Inks):
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {visitingCard500Materials.map((preset) => {
                      const isSelected = deductMatId === preset.matId;
                      return (
                        <div
                          key={preset.matId}
                          onClick={() => handleSelectVisitingCardMaterial(preset)}
                          className={`p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-amber-100/90 border-amber-400 ring-2 ring-amber-300 shadow-2xs'
                              : 'bg-white/90 hover:bg-white border-amber-200/90 hover:border-amber-400'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-bold text-slate-800 text-[11px]">{preset.shortName}</span>
                            <span className="font-mono font-bold text-amber-900 text-xs">${preset.cost.toFixed(2)}</span>
                          </div>
                          <div className="text-[11px] text-slate-600 font-mono mt-1">
                            {preset.formula}
                          </div>
                          <div className="mt-1.5 flex items-center justify-between text-[10px]">
                            <span className="text-slate-500">Deduct {preset.qty} {preset.unit}</span>
                            <span className="text-amber-800 font-bold underline">Click to Load &rarr;</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleBatchDeductVisitingCard500}
                      className="w-full py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold rounded-lg text-xs transition shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>⚡ 1-Click Batch Deduct All 4 Visiting Card Materials ($54.70 Total)</span>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleDeductStock} className="space-y-3 pt-1">
                  <div>
                    <label className="text-xs text-slate-700 font-semibold block mb-1">Select Raw Material</label>
                    <select
                      value={deductMatId}
                      onChange={(e) => {
                        const newId = Number(e.target.value);
                        setDeductMatId(newId);
                        const foundPreset = visitingCard500Materials.find(p => p.matId === newId);
                        if (foundPreset) {
                          setDeductQty(foundPreset.qty);
                          setDeductNote(foundPreset.note);
                        }
                      }}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                    >
                      {simMaterials.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.code} - {m.name} (Stock: {m.stock} {m.unit} @ ${m.price.toFixed(2)}/{m.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-700 font-semibold block mb-1">Quantity to Deduct / Consume</label>
                      <input
                        type="number"
                        step="0.01"
                        value={deductQty}
                        onChange={(e) => setDeductQty(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-700 font-semibold block mb-1">Calculated Cost Preview</label>
                      {(() => {
                        const targetMat = simMaterials.find(m => m.id === Number(deductMatId));
                        const calcCost = targetMat ? deductQty * targetMat.price : 0;
                        return (
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs flex items-center justify-between h-[38px]">
                            <span className="text-[10px] text-slate-500">
                              @{targetMat?.price.toFixed(2)}/{targetMat?.unit}
                            </span>
                            <span className="font-mono font-bold text-amber-900 text-sm">
                              ${calcCost.toFixed(2)}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-slate-700 font-semibold">Reference Note / Order Remarks</label>
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">reference_note</span>
                    </div>
                    <input
                      type="text"
                      value={deductNote}
                      onChange={(e) => setDeductNote(e.target.value)}
                      placeholder="e.g. Order #VIS-500: Sample visiting card test deduction"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      This reference note is logged permanently into the database ledger (<code>material_stock_movements.reference_note</code>).
                    </p>
                  </div>

                  {deductMsg && (
                    <div
                      className={`p-3 rounded-lg text-xs font-medium ${
                        deductMsg.type === 'error'
                          ? 'bg-rose-50 text-rose-800 border border-rose-300'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {deductMsg.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Record Consumption &amp; Deduct Single Material</span>
                  </button>
                </form>
              </div>

              {/* Movement Ledger */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>Audit Trail Ledger (material_stock_movements)</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">Tracks Reference Notes</span>
                </div>
                <div className="overflow-y-auto max-h-60 space-y-2 pr-1">
                  {simMovements.map(mov => (
                    <div key={mov.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            mov.type === 'PURCHASE' 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {mov.type}
                          </span>
                          <span className="font-semibold text-slate-800">{mov.mat}</span>
                        </div>
                        <div className="mt-1 flex items-center space-x-1.5 text-[11px] text-slate-600 bg-white px-2 py-1 rounded border border-slate-200 inline-flex">
                          <span className="text-slate-400 font-semibold">Ref Note:</span>
                          <span className="font-medium text-slate-700 font-sans">{mov.note}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">{mov.qty} units</div>
                        <div className="text-slate-500 font-mono">${mov.cost.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dedicated Record Consumption Modal */}
            {showConsumptionModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Layers className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">Record Material Consumption</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowConsumptionModal(false)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleModalRecordConsumption} className="space-y-4">
                    {/* Visiting Card Quick Presets */}
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/90 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-950">
                        <span>⚡ Visiting Card 500 Quick Presets (Order #VIS-500)</span>
                        <span className="text-[10px] text-amber-700 font-mono">1-Click Load</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                        {visitingCard500Materials.map(preset => (
                          <button
                            key={preset.matId}
                            type="button"
                            onClick={() => handleSelectVisitingCardMaterial(preset)}
                            className="text-left px-2 py-1.5 bg-white hover:bg-amber-100/70 border border-amber-200 rounded-lg text-[11px] transition cursor-pointer flex flex-col"
                          >
                            <span className="font-bold text-slate-800 truncate">{preset.shortName}</span>
                            <span className="text-[10px] text-amber-900 font-mono font-medium">
                              {preset.qty} {preset.unit} &rarr; ${preset.cost.toFixed(2)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">Raw Material</label>
                        {(() => {
                          const selected = simMaterials.find(m => m.id === Number(modalConsumeMatId));
                          return selected ? (
                            <span className="text-[11px] text-slate-500">
                              Available: <strong className="text-slate-800">{selected.stock} {selected.unit}</strong> (@${selected.price.toFixed(2)}/{selected.unit})
                            </span>
                          ) : null;
                        })()}
                      </div>
                      <select
                        value={modalConsumeMatId}
                        onChange={(e) => {
                          const newId = Number(e.target.value);
                          setModalConsumeMatId(newId);
                          const foundPreset = visitingCard500Materials.find(p => p.matId === newId);
                          if (foundPreset) {
                            setModalConsumeQty(foundPreset.qty);
                            setModalConsumeWasteQty(foundPreset.waste);
                            setModalConsumeNote(foundPreset.note);
                          }
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-600 font-medium"
                      >
                        {simMaterials.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.code} - {m.name} ({m.stock} {m.unit} in stock)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Quantity Consumed</label>
                        <input
                          type="number"
                          step="0.01"
                          value={modalConsumeQty}
                          onChange={(e) => setModalConsumeQty(Math.max(0.01, parseFloat(e.target.value) || 0))}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-600 font-medium"
                          required
                          min="0.01"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Waste / Scrap Allowance</label>
                        <input
                          type="number"
                          step="0.01"
                          value={modalConsumeWasteQty}
                          onChange={(e) => setModalConsumeWasteQty(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-rose-700 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Production Job / Order Link</label>
                      <select
                        value={modalConsumeOrderCode}
                        onChange={(e) => setModalConsumeOrderCode(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-600 font-mono"
                      >
                        <option value="">-- No Direct Job Linked (General Consumption) --</option>
                        {simProductionRuns.map(run => (
                          <option key={run.id} value={run.orderCode}>
                            {run.orderCode} - {run.productName} ({run.batchNumber})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">Consumption Reference Note</label>
                        <span className="text-[10px] text-amber-700 font-mono">reference_note</span>
                      </div>
                      <input
                        type="text"
                        value={modalConsumeNote}
                        onChange={(e) => setModalConsumeNote(e.target.value)}
                        placeholder="e.g. Order #VIS-500: Sample visiting card test proof (50 sheets)"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
                      />
                    </div>

                    {modalConsumeMsg && (
                      <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800">
                        {modalConsumeMsg.text}
                      </div>
                    )}

                    {/* Cost Preview */}
                    {(() => {
                      const selected = simMaterials.find(m => m.id === Number(modalConsumeMatId));
                      const cost = selected ? (Number(modalConsumeQty) || 0) * selected.price : 0;
                      return (
                        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 flex justify-between items-center">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-amber-800">Calculated Material Cost:</span>
                            <div className="font-bold text-amber-950 text-base font-mono">
                              ${cost.toFixed(2)}
                            </div>
                          </div>
                          <div className="text-right text-[11px] text-amber-900">
                            <div>{modalConsumeQty} {selected?.unit} &times; ${selected?.price.toFixed(2)}/{selected?.unit}</div>
                            <div className="text-amber-700 font-medium">Logged to <code>material_stock_movements</code></div>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setShowConsumptionModal(false)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm &amp; Record Consumption</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Module 4: Labour Costs */}
        {activeModule === 'labour' && (
          <div className="space-y-5">
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Labour Cost Management</h3>
                  <p className="text-xs text-slate-500">
                    Formula: <code>Total Labour Cost = Worker Count &times; Hours Worked &times; Hourly Rate</code>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenNewLabourModal}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Record Labour Cost</span>
                </button>
              </div>

              {labourSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{labourSuccessMsg}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLabourSuccessMsg(null)}
                    className="text-emerald-700 hover:text-emerald-900 cursor-pointer font-bold text-xs ml-3"
                  >
                    &times;
                  </button>
                </div>
              )}

              {/* Preset Standard Workshop Rates & Automated Computation Panel */}
              <div className="bg-gradient-to-br from-amber-50/90 via-amber-50/50 to-orange-50/40 rounded-2xl border border-amber-200/90 p-5 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-200/80">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Preset Standard Workshop Rates</h4>
                      <p className="text-xs text-slate-600">
                        The system computes labor automatically using your preset standard workshop rates:
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300">
                      Standard Total: $30.00
                    </span>
                  </div>
                </div>

                {/* The 2 Preset Workshop Operations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Operation 1: Press Operation & Printing */}
                  <div className="p-4 bg-white rounded-xl border border-amber-200 hover:border-amber-400 transition shadow-2xs space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">1</span>
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">Press Operation &amp; Printing</span>
                          <span className="text-[10px] text-slate-500">Offset &amp; Digital Press Makeready</span>
                        </div>
                      </div>
                      <span className="text-sm font-bold font-mono text-amber-950 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        $22.00
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 font-mono bg-slate-50 p-2 rounded-lg border border-slate-200">
                      1 Worker &times; 1.0 hour @ $22.00 = <strong className="text-amber-900">$22.00</strong>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-500">Rate: $22.00/hr &bull; 1 Worker</span>
                      <button
                        type="button"
                        onClick={handleApplyPressRate}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-2xs"
                      >
                        Apply Press Rate ($22.00)
                      </button>
                    </div>
                  </div>

                  {/* Operation 2: Guillotine Trimming, Packing & Inspection */}
                  <div className="p-4 bg-white rounded-xl border border-amber-200 hover:border-amber-400 transition shadow-2xs space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">2</span>
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">Guillotine Trimming, Packing &amp; Inspection</span>
                          <span className="text-[10px] text-slate-500">Precision Cut, Boxing &amp; QC</span>
                        </div>
                      </div>
                      <span className="text-sm font-bold font-mono text-amber-950 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        $8.00
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 font-mono bg-slate-50 p-2 rounded-lg border border-slate-200">
                      1 Worker &times; 0.5 hour @ $8.00 = <strong className="text-amber-900">$8.00</strong>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-500">Rate: $16.00/hr &bull; 0.5 hr</span>
                      <button
                        type="button"
                        onClick={handleApplyTrimmingRate}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-2xs"
                      >
                        Apply Trimming Rate ($8.00)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Auto-Calculated Total & Quick Action Row */}
                <div className="p-4 bg-amber-100/80 border border-amber-300 rounded-xl flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wider block">
                      Automated Workshop Rate Computation
                    </span>
                    <div className="flex items-baseline space-x-2 mt-0.5">
                      <span className="text-sm text-slate-700 font-medium">Total Labour Cost:</span>
                      <span className="text-xl font-bold font-mono text-amber-950">Auto-calculated as $30.00</span>
                      <span className="text-xs text-amber-800">($22.00 Press + $8.00 Trimming)</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleApplyCombinedRates}
                      className="px-3 py-2 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                    >
                      Compute $30.00 in Calculator
                    </button>
                    <button
                      type="button"
                      onClick={handleBatchRecordStandardLabour}
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>⚡ 1-Click Auto-Record Standard Workshop Labour ($30.00)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Calculator Controls */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs uppercase text-slate-700 tracking-wider">Live Labour Computation Calculator</h5>
                    <p className="text-[11px] text-slate-500">Adjust workers, hours, or rates &bull; system computes and updates audit log.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleUpdateLabourInfo}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-2xs flex items-center space-x-1"
                    title="Update labor information and notify"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Update Labour Information</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-700 font-semibold block mb-1">Worker Count</label>
                    <input
                      type="number"
                      value={labourWorkers}
                      onChange={(e) => setLabourWorkers(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-700 font-semibold block mb-1">Working Hours</label>
                    <input
                      type="number"
                      step="0.1"
                      value={labourHours}
                      onChange={(e) => setLabourHours(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-700 font-semibold block mb-1">Hourly Wage Rate ($)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={labourRate}
                      onChange={(e) => setLabourRate(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                      min="0"
                    />
                  </div>
                </div>

                <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase text-amber-900 font-bold tracking-wider">Automated Labour Cost Total</span>
                    <div className="text-2xl font-bold font-mono text-amber-950 mt-1">${totalLabourCalculated.toFixed(2)}</div>
                  </div>
                  <div className="text-xs text-amber-800 text-right">
                    Calculated for: <span className="font-bold">{labourWorkers} worker(s)</span> &times; <span className="font-bold">{labourHours} hrs</span> @ <span className="font-bold">${labourRate}/hr</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recorded Labour Register Table */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Recorded Labour Costs Register</h4>
                  <p className="text-xs text-slate-500">Audit trail of labour operations, task descriptions, and production links.</p>
                </div>
                <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-1 rounded-md border border-slate-200">
                  {simLabourRecords.length} Entries Recorded
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 font-semibold">
                      <th className="py-2.5 px-3">Labour Code</th>
                      <th className="py-2.5 px-3">Work Description</th>
                      <th className="py-2.5 px-3">Order Link</th>
                      <th className="py-2.5 px-3 text-center">Workers</th>
                      <th className="py-2.5 px-3 text-center">Hours</th>
                      <th className="py-2.5 px-3 text-right">Rate</th>
                      <th className="py-2.5 px-3 text-right">Total Cost</th>
                      <th className="py-2.5 px-3 text-center">Date</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {simLabourRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{record.code}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-800">{record.description}</div>
                          {record.notes && <div className="text-[11px] text-slate-500">{record.notes}</div>}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-sky-700">
                          {record.productionCode ? (
                            <span className="bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 font-bold">
                              {record.productionCode}
                            </span>
                          ) : (
                            <span className="text-slate-400">General</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-700">{record.workers}</td>
                        <td className="py-2.5 px-3 text-center text-slate-600">{record.hours} hrs</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">${record.rate.toFixed(2)}/hr</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-950 text-sm">
                          ${record.totalCost.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-500">{record.date}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleLoadLabourIntoCalculator(record)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold transition shadow-2xs cursor-pointer"
                          >
                            Load
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Record Labour Cost Modal */}
            {showLabourModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">+ Record Labour Cost</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLabourModal(false)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveLabourCost} className="space-y-4">
                    {/* Standard Workshop Rate Quick Presets */}
                    <div className="p-3 bg-amber-50/90 rounded-xl border border-amber-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-950 text-[11px] uppercase tracking-wide flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Standard Workshop Rate Presets</span>
                        </span>
                        <span className="text-[10px] text-amber-800 font-mono">1-Click Auto-Fill</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => handleSelectModalLabourPreset('press')}
                          className="p-2 bg-white hover:bg-amber-100/80 rounded-lg border border-amber-200 text-left transition cursor-pointer"
                        >
                          <div className="font-bold text-slate-900 text-[11px]">Press Operation</div>
                          <div className="text-[10px] text-slate-500">1w × 1.0h @ $22 = <strong className="text-amber-900 font-mono">$22.00</strong></div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectModalLabourPreset('guillotine')}
                          className="p-2 bg-white hover:bg-amber-100/80 rounded-lg border border-amber-200 text-left transition cursor-pointer"
                        >
                          <div className="font-bold text-slate-900 text-[11px]">Guillotine &amp; QC</div>
                          <div className="text-[10px] text-slate-500">1w × 0.5h @ $16 = <strong className="text-amber-900 font-mono">$8.00</strong></div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectModalLabourPreset('combined')}
                          className="p-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-left transition shadow-2xs cursor-pointer"
                        >
                          <div className="font-bold text-[11px]">Combined Total</div>
                          <div className="text-[10px] text-amber-100">Press + Trim: <strong className="font-mono">$30.00</strong></div>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Labour Code</label>
                        <input
                          type="text"
                          value={newLabourCode}
                          onChange={(e) => setNewLabourCode(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-amber-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Production Order</label>
                        <select
                          value={newLabourProdCode}
                          onChange={(e) => setNewLabourProdCode(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                        >
                          <option value="">-- General (No Job Link) --</option>
                          {simProductionRuns.map(run => (
                            <option key={run.id} value={run.orderCode}>
                              {run.orderCode} - {run.productName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Work Description</label>
                      <input
                        type="text"
                        value={newLabourDesc}
                        onChange={(e) => setNewLabourDesc(e.target.value)}
                        placeholder="e.g. Order #VIS-500: Precision cutting & corner bundling"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Worker Count</label>
                        <input
                          type="number"
                          value={newLabourWorkers}
                          onChange={(e) => setNewLabourWorkers(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Hours</label>
                        <input
                          type="number"
                          step="0.1"
                          value={newLabourHours}
                          onChange={(e) => setNewLabourHours(Math.max(0.1, parseFloat(e.target.value) || 0))}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                          min="0.1"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Hourly Rate ($)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={newLabourRate}
                          onChange={(e) => setNewLabourRate(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Notes / Operator Details</label>
                      <input
                        type="text"
                        value={newLabourNotes}
                        onChange={(e) => setNewLabourNotes(e.target.value)}
                        placeholder="e.g. Sample proof approved. Developing 500 cards."
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Cost Preview */}
                    <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs flex justify-between items-center">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-800">Calculated Total Labour Cost:</span>
                        <div className="font-bold text-amber-950 text-lg font-mono">
                          ${(newLabourWorkers * newLabourHours * newLabourRate).toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-amber-800">
                        {newLabourWorkers} workers &times; {newLabourHours} hrs @ ${newLabourRate}/hr
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setShowLabourModal(false)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Labour Cost</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Module 5: Machine Production */}
        {activeModule === 'machines' && (
          <div className="space-y-5">
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Machine & Production Orders</h3>
                  <p className="text-xs text-slate-500">
                    Record press runs, machine hours, rejected defect tracking, and material consumption.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 font-mono">
                    Total Runs: {simProductionRuns.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenNewRunModal}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ New Production Run</span>
                  </button>
                </div>
              </div>

              {runSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{runSuccessMsg}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRunSuccessMsg(null)}
                    className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
                  >
                    &times;
                  </button>
                </div>
              )}

              {/* Production Runs Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <Cpu className="w-4 h-4 text-sky-600" />
                    <span>Production Orders Register</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">Click &ldquo;Inspect / Load&rdquo; to test values in the live calculator</span>
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                        <th className="py-2.5 px-3">Order #</th>
                        <th className="py-2.5 px-3">Product Item</th>
                        <th className="py-2.5 px-3">Machine / Press Line</th>
                        <th className="py-2.5 px-3">Batch Number</th>
                        <th className="py-2.5 px-3 text-right">Gross Output</th>
                        <th className="py-2.5 px-3 text-right">Defects</th>
                        <th className="py-2.5 px-3 text-right">Net Good Qty</th>
                        <th className="py-2.5 px-3 text-right">Machine Cost</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {simProductionRuns.map((run) => (
                        <tr key={run.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-3 font-bold text-sky-900 font-mono">{run.orderCode}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            <div>{run.productName}</div>
                            {run.notes && (
                              <div className="text-[10px] text-slate-500 truncate max-w-xs">{run.notes}</div>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700">
                              {run.machineName || 'Heidelberg Printmaster / Digital Press'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{run.batchNumber}</td>
                          <td className="py-2.5 px-3 text-right font-medium text-slate-700">{run.quantityProduced.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right text-rose-600 font-medium">-{run.quantityRejected.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-700">{run.netGoodQuantity.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">${run.machineCost.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              run.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-sky-100 text-sky-800 border border-sky-300'
                            }`}>
                              {run.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleLoadRunIntoSimulator(run)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                            >
                              Load in Calculator
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Interactive Machine Operational Simulator */}
              <div className="pt-2 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Active Run Simulator &amp; Formula Engine</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Net Good = Produced ({prodTotalQty}) &minus; Defect ({prodRejectedQty}) = {netGoodQty} units
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <label className="text-xs text-slate-700 font-semibold block mb-1">Batch Number</label>
                    <input
                      type="text"
                      value={prodBatch}
                      onChange={(e) => setProdBatch(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-700 font-semibold block mb-1">Gross Produced Qty</label>
                    <input
                      type="number"
                      value={prodTotalQty}
                      onChange={(e) => setProdTotalQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-slate-900"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-700 font-semibold block mb-1">Defect / Rejected Qty</label>
                    <input
                      type="number"
                      value={prodRejectedQty}
                      onChange={(e) => setProdRejectedQty(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-rose-700 font-medium"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-700 font-semibold block mb-1">Net Good Output (Auto)</label>
                    <div className="w-full bg-emerald-50 border border-emerald-300 rounded-lg p-2 text-sm text-emerald-800 font-bold">
                      {netGoodQty.toLocaleString()} units
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-slate-700 font-semibold">Machine / Press Line</label>
                      <span className="text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 font-mono">machine_name</span>
                    </div>
                    <input
                      type="text"
                      value={prodMachineName}
                      onChange={(e) => setProdMachineName(e.target.value)}
                      placeholder="e.g. Heidelberg Printmaster / Digital Press"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-slate-900 font-medium"
                    />
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {['Heidelberg Printmaster / Digital Press', 'Heidelberg Speedmaster XL 75', 'Xerox Iridesse Press'].map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setProdMachineName(m)}
                          className="text-[10px] bg-white hover:bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 cursor-pointer"
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-700 font-semibold block mb-1">Press Machine Hours</label>
                    <input
                      type="number"
                      step="0.1"
                      value={machineHours}
                      onChange={(e) => setMachineHours(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-slate-900"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Includes setup, run time &amp; wash-up</span>
                  </div>
                  <div>
                    <label className="text-xs text-slate-700 font-semibold block mb-1">Machine Hourly Rate ($)</label>
                    <input
                      type="number"
                      step="1"
                      value={machineRate}
                      onChange={(e) => setMachineRate(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm text-slate-900"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Covers power, depreciation &amp; maintenance</span>
                  </div>
                </div>

                {/* Production Job Order Notes */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-slate-700 font-semibold flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                      <span>Production Job Reference Notes &amp; Sample Approval Remarks</span>
                    </label>
                    <span className="text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 font-mono">machine_productions.notes</span>
                  </div>
                  <textarea
                    rows={2}
                    value={prodNotes}
                    onChange={(e) => setProdNotes(e.target.value)}
                    placeholder="e.g. Client design approved. Sample 500 visiting cards run on 350gsm cardstock. Waste allowance verified."
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Use this to log design acceptance, proof approvals, sample raw material usage details, and production remarks.
                  </p>
                </div>

                {/* Total Machine Cost Card */}
                <div className="p-5 bg-sky-50 border border-sky-300 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-xs uppercase text-sky-900 font-bold">Total Machine Operational Cost</span>
                    <div className="text-2xl font-bold font-mono text-sky-950 mt-1">${totalMachineCost.toFixed(2)}</div>
                  </div>
                  <div className="text-xs text-sky-800 font-medium text-right">
                    <div>Machine: <span className="font-bold">{prodMachineName}</span></div>
                    <div>Calculated for: <span className="font-bold">{machineHours} hrs</span> @ <span className="font-bold">${machineRate}/hr</span></div>
                  </div>
                </div>

                {/* Machine Cost Calculation Breakdown */}
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-amber-950 text-xs flex items-center space-x-1.5">
                      <Cpu className="w-4 h-4 text-amber-700" />
                      <span>How Machine Operational Cost is Calculated</span>
                    </h5>
                    <span className="text-[11px] font-mono text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300">
                      Formula: Machine Cost = Operating Hours &times; Hourly Rate
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-amber-900">
                    <div className="bg-white p-3 rounded-lg border border-amber-200/80 space-y-1.5">
                      <div className="font-bold text-slate-800">1. Total Run Cost for {prodMachineName}:</div>
                      <div className="font-mono text-sm font-bold text-sky-900">
                        {machineHours} hrs &times; ${machineRate.toFixed(2)}/hr = ${totalMachineCost.toFixed(2)}
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Every machine hour factors in industrial electricity, press makeready, mechanical depreciation, and roller maintenance.
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-amber-200/80 space-y-1.5">
                      <div className="font-bold text-slate-800">2. Unit Machine Cost per Good Product:</div>
                      <div className="font-mono text-sm font-bold text-emerald-900">
                        ${totalMachineCost.toFixed(2)} &divide; {netGoodQty} units = ${netGoodQty > 0 ? (totalMachineCost / netGoodQty).toFixed(4) : '0.0000'} / unit
                      </div>
                      <p className="text-[11px] text-slate-600">
                        For a 500-pack of visiting cards, this adds approx. ${(netGoodQty > 0 ? (totalMachineCost / netGoodQty) * 500 : 0).toFixed(2)} machine cost to the job order.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-200/60 text-[11px] text-amber-900 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div><strong>⚡ Industrial Power:</strong> Motor &amp; UV drying kWh</div>
                    <div><strong>⏱️ Setup &amp; Makeready:</strong> Plate registration &amp; ink keys</div>
                    <div><strong>🛠️ Press Maintenance:</strong> Blankets, rollers &amp; wash-up</div>
                    <div><strong>📉 Machine Depreciation:</strong> Capital equipment lease/hr</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Explanatory note */}
            <div className="p-3.5 bg-sky-50/60 border border-sky-200 rounded-xl text-xs text-sky-900 flex items-start space-x-2.5">
              <Cpu className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <strong>Workflow Guide:</strong> Click <strong>+ New Production Run</strong> at the top right to register a new manufacturing job (such as a 500-pack of visiting cards on <strong>Heidelberg Printmaster / Digital Press</strong>). The system calculates Net Good Output, defect deductions, and machine operational costs automatically.
              </div>
            </div>

            {/* New Production Run Modal */}
            {showNewRunModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">Record New Production Run</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNewRunModal(false)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveProductionRun} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Product Item</label>
                      <select
                        value={newRunProductId}
                        onChange={(e) => setNewRunProductId(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                      >
                        {simProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.code} - {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">Machine / Press Line <span className="text-rose-500">*</span></label>
                        <span className="text-[10px] text-sky-700 font-mono">machine_name</span>
                      </div>
                      <input
                        type="text"
                        value={newRunMachineName}
                        onChange={(e) => setNewRunMachineName(e.target.value)}
                        placeholder="e.g. Heidelberg Printmaster / Digital Press"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600 font-medium"
                        required
                      />
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        {['Heidelberg Printmaster / Digital Press', 'Heidelberg Speedmaster XL 75', 'Xerox Iridesse Press', 'Komori Lithrone G40'].map(m => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setNewRunMachineName(m)}
                            className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded cursor-pointer transition border border-slate-200"
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Order #</label>
                        <input
                          type="text"
                          value={newRunOrderCode}
                          onChange={(e) => setNewRunOrderCode(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-600"
                          placeholder="e.g. PROD-2024-003"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Batch Number</label>
                        <input
                          type="text"
                          value={newRunBatch}
                          onChange={(e) => setNewRunBatch(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-600"
                          placeholder="e.g. BATCH-VIS-02"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Gross Produced Qty</label>
                        <input
                          type="number"
                          value={newRunTotalQty}
                          onChange={(e) => setNewRunTotalQty(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Defects / Rejected Qty</label>
                        <input
                          type="number"
                          value={newRunRejectedQty}
                          onChange={(e) => setNewRunRejectedQty(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-rose-700 focus:outline-none focus:border-sky-600"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Machine Hours</label>
                        <input
                          type="number"
                          step="0.1"
                          value={newRunHours}
                          onChange={(e) => setNewRunHours(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Rate ($/hr)</label>
                        <input
                          type="number"
                          step="1"
                          value={newRunRate}
                          onChange={(e) => setNewRunRate(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Status</label>
                        <select
                          value={newRunStatus}
                          onChange={(e) => setNewRunStatus(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-2 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                        >
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Production Date</label>
                      <input
                        type="date"
                        value={newRunDate}
                        onChange={(e) => setNewRunDate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Reference Notes &amp; Sample Approval Remarks</label>
                      <textarea
                        value={newRunNotes}
                        onChange={(e) => setNewRunNotes(e.target.value)}
                        placeholder="e.g. Order #VIS-500: Client approved sample proof. 500 cards developing."
                        rows={2}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600 resize-none"
                      />
                    </div>

                    <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-900 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-sky-800">Net Good Output:</span>
                        <div className="font-bold text-sky-950 text-sm">
                          {Math.max(0, newRunTotalQty - newRunRejectedQty).toLocaleString()} units
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-sky-800">Est. Machine Cost:</span>
                        <div className="font-bold text-sky-950 font-mono text-sm">
                          ${(newRunHours * newRunRate).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setShowNewRunModal(false)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Production Run</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Module 6: Other Expenses */}
        {activeModule === 'expenses' && (
          <div className="space-y-5">
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Other Expenses &amp; Overheads</h3>
                  <p className="text-xs text-slate-500">Track industrial electricity, freight transport, packaging, and plate chemicals.</p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenNewExpenseModal}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Expense</span>
                </button>
              </div>

              {expenseSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{expenseSuccessMsg}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpenseSuccessMsg(null)}
                    className="text-emerald-700 hover:text-emerald-900 cursor-pointer font-bold text-xs ml-3"
                  >
                    &times;
                  </button>
                </div>
              )}

              {/* Preset Standard Job Overheads Panel */}
              <div className="bg-gradient-to-br from-teal-50/90 via-teal-50/50 to-emerald-50/40 rounded-2xl border border-teal-200/90 p-5 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-teal-200/80">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Preset Standard Job Overheads</h4>
                      <p className="text-xs text-slate-600">
                        The system computes overheads automatically using your preset standard workshop rates:
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono font-bold text-teal-900 bg-teal-100 px-2.5 py-1 rounded-lg border border-teal-300">
                      Standard Total: $6.50
                    </span>
                  </div>
                </div>

                {/* The 2 Preset Overhead Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Overhead 1: Visiting Card Acrylic / Cardboard Box */}
                  <div className="p-4 bg-white rounded-xl border border-teal-200 hover:border-teal-400 transition shadow-2xs space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-bold">1</span>
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">Visiting Card Acrylic / Cardboard Box</span>
                          <span className="text-[10px] text-slate-500">Premium Packaging &amp; Presentation Case</span>
                        </div>
                      </div>
                      <span className="text-sm font-bold font-mono text-teal-950 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        $1.50
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 font-mono bg-slate-50 p-2 rounded-lg border border-slate-200">
                      1 unit &times; $1.50 = <strong className="text-teal-900">$1.50</strong>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-500">Packaging &bull; 1 unit</span>
                      <button
                        type="button"
                        onClick={handleApplyBoxOverhead}
                        className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-2xs"
                      >
                        Apply Box Overhead ($1.50)
                      </button>
                    </div>
                  </div>

                  {/* Overhead 2: Local Courier / Delivery */}
                  <div className="p-4 bg-white rounded-xl border border-teal-200 hover:border-teal-400 transition shadow-2xs space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center text-xs font-bold">2</span>
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">Local Courier / Delivery</span>
                          <span className="text-[10px] text-slate-500">Same-Day Direct Delivery</span>
                        </div>
                      </div>
                      <span className="text-sm font-bold font-mono text-teal-950 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        $5.00
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 font-mono bg-slate-50 p-2 rounded-lg border border-slate-200">
                      1 delivery &times; $5.00 = <strong className="text-teal-900">$5.00</strong>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-500">Transport &bull; 1 trip</span>
                      <button
                        type="button"
                        onClick={handleApplyCourierOverhead}
                        className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-2xs"
                      >
                        Apply Courier Overhead ($5.00)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Auto-Calculated Total & Quick Action Row */}
                <div className="p-4 bg-teal-100/80 border border-teal-300 rounded-xl flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-teal-900 tracking-wider block">
                      Automated Job Overheads Computation
                    </span>
                    <div className="flex items-baseline space-x-2 mt-0.5">
                      <span className="text-sm text-slate-700 font-medium">Total Other Overheads:</span>
                      <span className="text-xl font-bold font-mono text-teal-950">Auto-calculated as $6.50</span>
                      <span className="text-xs text-teal-800">($1.50 Box + $5.00 Delivery)</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleApplyCombinedOverheads}
                      className="px-3 py-2 bg-white hover:bg-teal-50 text-teal-900 border border-teal-300 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                    >
                      Compute $6.50 in Calculator
                    </button>
                    <button
                      type="button"
                      onClick={handleBatchRecordStandardOverheads}
                      className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>⚡ 1-Click Auto-Record Standard Overheads Package ($6.50)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Calculator Inputs */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs uppercase text-slate-700 tracking-wider">Live Expense &amp; Overhead Calculator</h5>
                    <p className="text-[11px] text-slate-500">Calculate single or bulk expenses &bull; system computes and updates database.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleUpdateExpenseInfo}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-2xs flex items-center space-x-1"
                    title="Update expense information and notify"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Update Expense Information</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-700 font-semibold block mb-1">Expense Type</label>
                    <select className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-teal-500 font-medium">
                      <option>Packaging Boxes &amp; Presentation Cases</option>
                      <option>Transport / Delivery Couriers</option>
                      <option>Electricity (Industrial Meter)</option>
                      <option>Pre-press Chemical Wash</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-700 font-semibold block mb-1">Units / Quantity</label>
                    <input
                      type="number"
                      step="0.01"
                      value={expenseQty}
                      onChange={(e) => setExpenseQty(parseFloat(e.target.value) || 1)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-teal-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-700 font-semibold block mb-1">Unit Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={expenseUnitPrice}
                      onChange={(e) => setExpenseUnitPrice(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-teal-500 font-medium"
                    />
                  </div>
                </div>

                <div className="p-4 bg-teal-50/80 border border-teal-300 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-xs uppercase text-teal-900 font-bold tracking-wider">Total Expense Amount</span>
                    <div className="text-2xl font-bold font-mono text-teal-950 mt-1">${totalExpense.toFixed(2)}</div>
                  </div>
                  <div className="text-xs text-teal-800 font-medium text-right">
                    Auto calculated: <span className="font-bold">{expenseQty} units</span> @ <span className="font-bold">${expenseUnitPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Expenses Register Table */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Recorded Expenses &amp; Overheads Register</h4>
                  <p className="text-xs text-slate-500">Categorized operational costs attributed to general operations or production jobs.</p>
                </div>
                <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-1 rounded-md border border-slate-200">
                  {simExpenseRecords.length} Expenses Recorded
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 font-semibold">
                      <th className="py-2.5 px-3">Code</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Order Link</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Total Amount</th>
                      <th className="py-2.5 px-3 text-center">Date</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {simExpenseRecords.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{exp.code}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                            {exp.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{exp.description}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-sky-700">
                          {exp.productionCode ? (
                            <span className="bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 font-bold">
                              {exp.productionCode}
                            </span>
                          ) : (
                            <span className="text-slate-400">General</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-700 font-bold">{exp.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">${exp.unitPrice.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-950 text-sm">
                          ${exp.totalCost.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-500">{exp.date}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleLoadExpenseIntoCalculator(exp)}
                            className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 rounded-lg text-[11px] font-bold transition shadow-2xs cursor-pointer"
                          >
                            Load
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add Expense Modal */}
            {showExpenseModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">+ Add Expense</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowExpenseModal(false)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveExpense} className="space-y-4">
                    {/* Standard Job Overheads Quick Presets */}
                    <div className="p-3 bg-teal-50/90 rounded-xl border border-teal-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-teal-950 text-[11px] uppercase tracking-wide flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                          <span>Standard Overheads Presets</span>
                        </span>
                        <span className="text-[10px] text-teal-800 font-mono">1-Click Auto-Fill</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => handleSelectModalExpensePreset('box')}
                          className="p-2 bg-white hover:bg-teal-100/80 rounded-lg border border-teal-200 text-left transition cursor-pointer"
                        >
                          <div className="font-bold text-slate-900 text-[11px]">Acrylic / Cardboard Box</div>
                          <div className="text-[10px] text-slate-500">1 unit @ $1.50 = <strong className="text-teal-900 font-mono">$1.50</strong></div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectModalExpensePreset('courier')}
                          className="p-2 bg-white hover:bg-teal-100/80 rounded-lg border border-teal-200 text-left transition cursor-pointer"
                        >
                          <div className="font-bold text-slate-900 text-[11px]">Local Courier / Delivery</div>
                          <div className="text-[10px] text-slate-500">1 trip @ $5.00 = <strong className="text-teal-900 font-mono">$5.00</strong></div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectModalExpensePreset('combined')}
                          className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-left transition shadow-2xs cursor-pointer"
                        >
                          <div className="font-bold text-[11px]">Combined Total</div>
                          <div className="text-[10px] text-teal-100">Box + Courier: <strong className="font-mono">$6.50</strong></div>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Expense Code</label>
                        <input
                          type="text"
                          value={newExpenseCode}
                          onChange={(e) => setNewExpenseCode(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-teal-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Expense Type</label>
                        <select
                          value={newExpenseType}
                          onChange={(e) => setNewExpenseType(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                        >
                          <option>Packaging</option>
                          <option>Electricity</option>
                          <option>Transport</option>
                          <option>Plates/Chemicals</option>
                          <option>Maintenance</option>
                          <option>Overhead</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
                      <input
                        type="text"
                        value={newExpenseDesc}
                        onChange={(e) => setNewExpenseDesc(e.target.value)}
                        placeholder="e.g. Order #VIS-500: Clear visiting card presentation boxes"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Production Order Link</label>
                        <select
                          value={newExpenseProdCode}
                          onChange={(e) => setNewExpenseProdCode(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-teal-500"
                        >
                          <option value="">-- General (No Job Link) --</option>
                          {simProductionRuns.map(run => (
                            <option key={run.id} value={run.orderCode}>
                              {run.orderCode} - {run.productName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Date</label>
                        <input
                          type="date"
                          value={newExpenseDate}
                          onChange={(e) => setNewExpenseDate(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Quantity / Units</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newExpenseQuantity}
                          onChange={(e) => setNewExpenseQuantity(Math.max(0.01, parseFloat(e.target.value) || 0))}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-teal-500"
                          min="0.01"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Unit Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newExpenseUnitPrice}
                          onChange={(e) => setNewExpenseUnitPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-teal-500"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    {/* Cost Preview */}
                    <div className="p-3.5 bg-teal-50 rounded-xl border border-teal-200 text-xs flex justify-between items-center">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-teal-800">Calculated Expense Amount:</span>
                        <div className="font-bold text-teal-950 text-lg font-mono">
                          ${(newExpenseQuantity * newExpenseUnitPrice).toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-teal-800">
                        {newExpenseQuantity} units &times; ${newExpenseUnitPrice.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setShowExpenseModal(false)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Expense</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Module 7: Production Cost & Profit Analysis (Admin & Manager) */}
        {activeModule === 'analysis' && canAccessCostAnalysis && (
          <div className="space-y-5">
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-sky-600" />
                    <span>Production Cost &amp; Profit Analysis Engine</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Automated calculation of Total Cost, Cost Per Unit, COGS, Revenue, and Margin.
                    Unsold inventory is never fabricated as realized profit.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenNewAnalysisModal}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ New Analysis</span>
                </button>
              </div>

              {analysisSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{analysisSuccessMsg}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAnalysisSuccessMsg(null)}
                    className="text-emerald-700 hover:text-emerald-900 cursor-pointer font-bold text-xs ml-3"
                  >
                    &times;
                  </button>
                </div>
              )}

              {/* Quick Visiting Card 500 Complete Cost Analysis Preset */}
              <div className="p-4 bg-sky-50/80 rounded-xl border border-sky-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sky-950 uppercase tracking-wide block text-[11px]">
                      Visiting Card 500 Complete Cost &amp; Profit Breakdown (Order #VIS-500)
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                      Completed Order &bull; 1 Pack (500 Cards)
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px] mt-1 space-x-2">
                    <span>Materials: <strong>$54.70</strong></span> &bull;
                    <span>Labour: <strong>$30.00</strong> (Press $22 + Guillotine $8)</span> &bull;
                    <span>Machine: <strong>$25.76</strong></span> &bull;
                    <span>Expenses: <strong>$6.50</strong> (Box $1.50 + Courier $5.00)</span> &bull;
                    <span className="text-sky-950 font-bold font-mono">COGS: $116.96 ($0.2339/card)</span> &bull;
                    <span className="text-emerald-800 font-bold font-mono">Invoiced: $180.00 ($0.36/card)</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLoadVis500SalesAndInvoicing}
                  className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-xs flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Load VIS-500 Sales &amp; Invoicing</span>
                </button>
              </div>

              {/* Cost Component Inputs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="text-xs text-slate-700 font-semibold block mb-1">Raw Material Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={analysisMatCost}
                    onChange={(e) => setAnalysisMatCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">VIS-500: $54.70 (Sheets, CTP, Film, Ink)</span>
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-semibold block mb-1">Labour Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={analysisLabCost}
                    onChange={(e) => setAnalysisLabCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">VIS-500: $30.00 (Press $22 + Trimming $8)</span>
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-semibold block mb-1">Machine Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={analysisMachCost}
                    onChange={(e) => setAnalysisMachCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">VIS-500: $25.76 (Heidelberg press run)</span>
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-semibold block mb-1">Other Overheads ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={analysisExpCost}
                    onChange={(e) => setAnalysisExpCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">VIS-500: $6.50 (Box $1.50 + Courier $5.00)</span>
                </div>
              </div>

              {/* Module Section: Enter Sales & Invoicing */}
              <div className="p-5 bg-gradient-to-r from-sky-50/90 via-slate-50 to-indigo-50/70 rounded-xl border border-sky-200 space-y-4 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      $
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                        <span>Enter Sales &amp; Invoicing</span>
                        <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-300 uppercase tracking-wider">
                          Realized Sales Revenue Guard
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Record invoiced client orders, sold card quantities, and verify net realized margins against COGS.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-semibold text-slate-700">Realized Sales Guard:</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={analysisSalesRecorded}
                        onChange={(e) => setAnalysisSalesRecorded(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-200/80">
                  <div>
                    <label className="text-xs text-slate-700 font-semibold block mb-1">
                      Units Sold (Completed Order)
                    </label>
                    <input
                      type="number"
                      value={analysisActualSold}
                      onChange={(e) => setAnalysisActualSold(Math.max(0, parseInt(e.target.value) || 0))}
                      disabled={!analysisSalesRecorded}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-mono font-bold disabled:bg-slate-100 disabled:text-slate-400"
                      min="0"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">e.g. 500 Cards (1 completed order)</span>
                  </div>

                  <div>
                    <label className="text-xs text-slate-700 font-semibold block mb-1">
                      Client Invoiced Amount ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={Number((analysisActualSold * analysisSellingPrice).toFixed(2))}
                      onChange={(e) => {
                        const totalInv = Math.max(0, parseFloat(e.target.value) || 0);
                        if (analysisActualSold > 0) {
                          setAnalysisSellingPrice(Number((totalInv / analysisActualSold).toFixed(4)));
                        }
                      }}
                      disabled={!analysisSalesRecorded}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-mono font-bold disabled:bg-slate-100 disabled:text-slate-400"
                      placeholder="180.00"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">1 Pack @ $180.00 Invoiced</span>
                  </div>

                  <div>
                    <label className="text-xs text-slate-700 font-semibold block mb-1">
                      Selling Price / Card ($)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={analysisSellingPrice}
                      onChange={(e) => setAnalysisSellingPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                      disabled={!analysisSalesRecorded}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-mono font-bold disabled:bg-slate-100 disabled:text-slate-400"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">or $0.36 per card ($180 / 500)</span>
                  </div>

                  <div>
                    <label className="text-xs text-slate-700 font-semibold block mb-1">
                      Gross Units Produced
                    </label>
                    <input
                      type="number"
                      value={analysisUnitsProduced}
                      onChange={(e) => setAnalysisUnitsProduced(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-mono font-bold"
                      min="1"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Total batch units (500 cards)</span>
                  </div>
                </div>
              </div>

              {/* Calculations Result - 6 Column Breakdown including COGS */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 p-5 bg-sky-50/70 rounded-xl border border-sky-200 text-center shadow-xs">
                <div className="p-2 bg-white/70 rounded-lg border border-sky-100">
                  <div className="text-[10px] font-bold text-slate-600 uppercase">Total Production Cost</div>
                  <div className="text-lg font-bold text-slate-900 mt-1 font-mono">${totalProdCost.toFixed(2)}</div>
                  <div className="text-[9px] text-slate-500">Mat + Lab + Mach + Exp</div>
                </div>
                <div className="p-2 bg-white/70 rounded-lg border border-sky-100">
                  <div className="text-[10px] font-bold text-slate-600 uppercase">Cost Per Unit</div>
                  <div className="text-lg font-bold text-sky-700 mt-1 font-mono">${costPerUnit.toFixed(4)}</div>
                  <div className="text-[9px] text-slate-500">Total Cost / 500</div>
                </div>
                <div className="p-2 bg-white/70 rounded-lg border border-indigo-100">
                  <div className="text-[10px] font-bold text-indigo-900 uppercase">Cost of Goods Sold (COGS)</div>
                  <div className="text-lg font-bold text-indigo-700 mt-1 font-mono">
                    {analysisSalesRecorded ? `$${cogs.toFixed(2)}` : '$0.00'}
                  </div>
                  <div className="text-[9px] text-indigo-500 font-semibold">Unit Cost &times; Sold Qty</div>
                </div>
                <div className="p-2 bg-white/70 rounded-lg border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-600 uppercase">Revenue</div>
                  <div className="text-lg font-bold text-slate-900 mt-1 font-mono">
                    {analysisSalesRecorded ? `$${realizedRevenue.toFixed(2)}` : '$0.00 (Unsold)'}
                  </div>
                  <div className="text-[9px] text-slate-500">Invoiced Sold Amount</div>
                </div>
                <div className="p-2 bg-emerald-50/80 rounded-lg border border-emerald-200">
                  <div className="text-[10px] font-bold text-emerald-800 uppercase">Net Realized Profit</div>
                  <div className="text-lg font-bold text-emerald-700 mt-1 font-mono">
                    {analysisSalesRecorded ? `$${realizedProfit.toFixed(2)}` : '$0.00 (Pending)'}
                  </div>
                  <div className="text-[9px] text-emerald-600 font-semibold">Revenue &minus; COGS</div>
                </div>
                <div className="p-2 bg-cyan-50/80 rounded-lg border border-cyan-200">
                  <div className="text-[10px] font-bold text-cyan-800 uppercase">Profit Margin</div>
                  <div className="text-lg font-bold text-cyan-700 mt-1 font-mono">
                    {analysisSalesRecorded ? `${profitMarginPct.toFixed(2)}%` : '0.00%'}
                  </div>
                  <div className="text-[9px] text-cyan-600 font-semibold">(Profit / Revenue) &times; 100</div>
                </div>
              </div>
            </div>
          </div>

            {/* Cost & Profit Analysis Register Table */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Cost &amp; Profit Analyses Register</h4>
                  <p className="text-xs text-slate-500">Historical financial audits, COGS realizations, and verified profit margins.</p>
                </div>
                <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-1 rounded-md border border-slate-200">
                  {simAnalysisRecords.length} Analyses Generated
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 font-semibold">
                      <th className="py-2.5 px-3">Analysis Code</th>
                      <th className="py-2.5 px-3">Order Link</th>
                      <th className="py-2.5 px-3">Product Item</th>
                      <th className="py-2.5 px-3 text-right">Total Cost</th>
                      <th className="py-2.5 px-3 text-center">Produced Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Cost</th>
                      <th className="py-2.5 px-3 text-center">Sold Qty</th>
                      <th className="py-2.5 px-3 text-right">COGS</th>
                      <th className="py-2.5 px-3 text-right">Revenue</th>
                      <th className="py-2.5 px-3 text-right">Profit</th>
                      <th className="py-2.5 px-3 text-right">Margin</th>
                      <th className="py-2.5 px-3 text-center">Date</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {simAnalysisRecords.map((ana) => (
                      <tr key={ana.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-2.5 px-3 font-mono font-bold text-sky-800">{ana.code}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                          <span className="bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 font-bold text-sky-800">
                            {ana.productionCode}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800 max-w-xs truncate">{ana.productName}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">${ana.totalCost.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-center text-slate-700 font-bold">{ana.producedQty}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">${ana.costPerUnit.toFixed(4)}</td>
                        <td className="py-2.5 px-3 text-center text-slate-700 font-bold">{ana.actualSoldQty}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-indigo-700 font-bold">${ana.cogs.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">${ana.revenue.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 text-sm">
                          ${ana.profit.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-cyan-800 font-mono">
                          {ana.profitMarginPct.toFixed(2)}%
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-500">{ana.date}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleLoadAnalysisIntoEngine(ana)}
                            className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 rounded-lg text-[11px] font-bold transition shadow-2xs cursor-pointer"
                          >
                            Load
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* New Cost & Profit Analysis Modal */}
            {showAnalysisModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-xl w-full p-6 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">+ New Cost &amp; Profit Analysis</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAnalysisModal(false)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveAnalysis} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Analysis Code</label>
                        <input
                          type="text"
                          value={newAnaCode}
                          onChange={(e) => setNewAnaCode(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-sky-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Production Order Link</label>
                        <select
                          value={newAnaProdCode}
                          onChange={(e) => {
                            const newCode = e.target.value;
                            setNewAnaProdCode(newCode);
                            const found = simProductionRuns.find(r => r.orderCode === newCode);
                            if (found) {
                              setNewAnaProducedQty(found.quantityProduced);
                              setNewAnaSoldQty(found.quantityProduced);
                              if (newCode === 'PROD-2024-002') {
                                setNewAnaMatCost(54.70);
                                setNewAnaLabCost(30.00);
                                setNewAnaMachCost(25.76);
                                setNewAnaExpCost(6.50);
                                setNewAnaSellingPrice(0.36);
                                setNewAnaSoldQty(500);
                                setNewAnaProducedQty(500);
                              }
                            }
                          }}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-500"
                        >
                          {simProductionRuns.map(run => (
                            <option key={run.id} value={run.orderCode}>
                              {run.orderCode} - {run.productName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Quick Preset inside Modal */}
                    <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-sky-950 block text-[11px]">Visiting Cards #VIS-500 Invoicing Preset:</span>
                        <span className="text-slate-600 text-[10px]">500 Cards &bull; Invoiced $180.00 ($0.36/card) &bull; COGS $116.96 &bull; Net Profit $63.04 (35.02%)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setNewAnaProdCode('PROD-2024-002');
                          setNewAnaMatCost(54.70);
                          setNewAnaLabCost(30.00);
                          setNewAnaMachCost(25.76);
                          setNewAnaExpCost(6.50);
                          setNewAnaProducedQty(500);
                          setNewAnaSoldQty(500);
                          setNewAnaSellingPrice(0.36);
                        }}
                        className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[11px] font-bold transition cursor-pointer"
                      >
                        Apply VIS-500
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Raw Material ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newAnaMatCost}
                          onChange={(e) => setNewAnaMatCost(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-sky-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Labour Cost ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newAnaLabCost}
                          onChange={(e) => setNewAnaLabCost(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-sky-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Machine Cost ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newAnaMachCost}
                          onChange={(e) => setNewAnaMachCost(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-sky-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Other Overheads ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newAnaExpCost}
                          onChange={(e) => setNewAnaExpCost(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-sky-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Units Produced</label>
                        <input
                          type="number"
                          value={newAnaProducedQty}
                          onChange={(e) => setNewAnaProducedQty(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-sky-500"
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Units Sold</label>
                        <input
                          type="number"
                          value={newAnaSoldQty}
                          onChange={(e) => setNewAnaSoldQty(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-sky-500"
                          min="0"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Client Invoiced ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={Number((newAnaSoldQty * newAnaSellingPrice).toFixed(2))}
                          onChange={(e) => {
                            const tot = Math.max(0, parseFloat(e.target.value) || 0);
                            if (newAnaSoldQty > 0) {
                              setNewAnaSellingPrice(Number((tot / newAnaSoldQty).toFixed(4)));
                            }
                          }}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-sky-500"
                          placeholder="180.00"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Price / Unit ($)</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={newAnaSellingPrice}
                          onChange={(e) => setNewAnaSellingPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-sky-500"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    {/* Cost & Profit Live Preview */}
                    {(() => {
                      const calcTotal = newAnaMatCost + newAnaLabCost + newAnaMachCost + newAnaExpCost;
                      const calcUnit = newAnaProducedQty > 0 ? calcTotal / newAnaProducedQty : 0;
                      const calcRev = newAnaSoldQty * newAnaSellingPrice;
                      const calcCogs = calcUnit * newAnaSoldQty;
                      const calcProfit = calcRev - calcCogs;
                      const calcMargin = calcRev > 0 ? (calcProfit / calcRev) * 100 : 0;
                      return (
                        <div className="grid grid-cols-3 gap-2 p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Cost</span>
                            <span className="font-mono font-bold text-slate-900 text-sm">${calcTotal.toFixed(2)}</span>
                            <span className="text-[10px] text-slate-500 block">(${calcUnit.toFixed(4)}/unit)</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">Revenue</span>
                            <span className="font-mono font-bold text-slate-900 text-sm">${calcRev.toFixed(2)}</span>
                            <span className="text-[10px] text-slate-500 block">COGS: ${calcCogs.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-emerald-800 block uppercase font-bold">Realized Profit</span>
                            <span className="font-mono font-bold text-emerald-700 text-sm">${calcProfit.toFixed(2)}</span>
                            <span className="text-[10px] text-cyan-800 font-bold block">{calcMargin.toFixed(2)}% margin</span>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setShowAnalysisModal(false)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save &amp; Realize Analysis</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Module 8: User Security & Role Management (Admin Only) */}
        {activeModule === 'roles' && canAccessUserSecurity && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">User Security & Role Access Management</h3>
                <p className="text-xs text-slate-500">
                  Manage team accounts, create new credentials with initial temporary passwords, and enforce first-time password updates.
                </p>
              </div>

              {/* Action Button: Create New User */}
              <button
                type="button"
                onClick={() => {
                  setShowCreateUserModal(true);
                  setUserCreationSuccess(null);
                  setUserCreationError(null);
                }}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create New User</span>
              </button>
            </div>

            {userCreationSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{userCreationSuccess}</span>
              </div>
            )}

            {adminResetSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{adminResetSuccessMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAdminResetSuccessMessage(null)}
                  className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
                >
                  &times;
                </button>
              </div>
            )}

            {/* Pending Password Reset Requests (Staff & Manager Forgot Password) */}
            {resetRequests.length > 0 && (
              <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center space-x-2">
                    <KeyRound className="w-5 h-5 text-amber-600" />
                    <h4 className="text-sm font-bold text-amber-950">
                      Pending Password Reset Requests ({resetRequests.length})
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                    Administrator Permission Required
                  </span>
                </div>
                <p className="text-xs text-amber-800 mb-3">
                  The following users reported a forgotten password. Under Seagull Printers security compliance, only you (System Administrator) have permission to issue a temporary reset.
                </p>
                <div className="space-y-2">
                  {resetRequests.map(req => (
                    <div key={req.id} className="bg-white border border-amber-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-xs text-slate-900">
                          {req.fullName} <span className="font-mono text-slate-500">(@{req.username})</span> &bull; <span className="text-amber-800 font-semibold">{req.roleName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Note: "{req.reason}" &bull; Requested: {req.requestedAt}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const target = users.find(u => u.id === req.userId);
                          if (target) {
                            setResetTargetUser(target);
                            setAdminTempResetPassword('SeagullReset2026!');
                          }
                        }}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center space-x-1.5"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Authorize & Reset Password</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Users Table - Passwords hidden */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3.5">Security Role</th>
                    <th className="py-3 px-3.5">Assigned Username</th>
                    <th className="py-3 px-3.5">Full Name</th>
                    <th className="py-3 px-3.5">Email</th>
                    <th className="py-3 px-3.5">First-Time Login Status</th>
                    <th className="py-3 px-3.5">Account Status</th>
                    <th className="py-3 px-3.5 text-right">Administrator Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'ROLE_ADMIN' 
                            ? 'bg-rose-100 text-rose-800' 
                            : u.role === 'ROLE_MANAGER' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-sky-100 text-sky-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5 font-mono text-slate-900 font-bold">{u.username}</td>
                      <td className="py-3.5 px-3.5 text-slate-800 font-medium">{u.fullName}</td>
                      <td className="py-3.5 px-3.5 text-slate-500 font-mono">{u.email}</td>
                      <td className="py-3.5 px-3.5">
                        {u.mustChangePassword ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                            <KeyRound className="w-3 h-3 text-amber-600" />
                            <span>Initial Password (Change Required)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Permanent Password Active</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5 text-right">
                        {u.role !== 'ROLE_ADMIN' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setResetTargetUser(u);
                              setAdminTempResetPassword('SeagullReset2026!');
                            }}
                            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                              resetRequests.some(r => r.userId === u.id)
                                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs animate-pulse'
                                : 'bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200 hover:border-amber-300'
                            }`}
                            title="Admin-only permission to reset password"
                          >
                            <KeyRound className="w-3 h-3" />
                            <span>{resetRequests.some(r => r.userId === u.id) ? 'Reset Password (Requested)' : 'Reset Password'}</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Master Administrator</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Explanatory security policy note */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
              <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Enterprise Password Security & Admin-Only Reset Policy</span>
              </div>
              <p>
                <strong>Admin-Exclusive Reset Permission:</strong> When a Production Manager or Floor Operator forgets their password, self-service password recovery is prohibited for security compliance. Only the <strong>System Administrator</strong> has the privilege to reset credentials. Once reset, the user is issued a temporary password and must set their permanent password on next login.
              </p>
            </div>
          </div>
        )}

        {/* Admin Reset Password Modal */}
        {resetTargetUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Authorize Password Reset</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setResetTargetUser(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 mb-4 space-y-1">
                <div className="font-bold flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Administrator Privilege Verification</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  You are resetting credentials for <strong>{resetTargetUser.fullName}</strong> ({resetTargetUser.roleName}). A temporary password will be assigned, and they will be forced to set their permanent password upon login.
                </p>
              </div>

              <form onSubmit={handleAdminExecuteReset} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Target Account</label>
                  <input
                    type="text"
                    value={`${resetTargetUser.fullName} (@${resetTargetUser.username})`}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Temporary Reset Password *</label>
                  <input
                    type="text"
                    value={adminTempResetPassword}
                    onChange={(e) => setAdminTempResetPassword(e.target.value)}
                    placeholder="Enter temporary password"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-600"
                    required
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Provide this temporary password to the user. Their account will be flagged for mandatory password change on login.
                  </span>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setResetTargetUser(null)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center space-x-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Authorize & Reset Password</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* Admin "Create New User" Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Create New System User</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCreateUserModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {userCreationError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{userCreationError}</span>
              </div>
            )}

            <form onSubmit={handleAdminCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Assigned Username <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. john_press"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="e.g. John Miller"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. john@seagullprinters.com"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Security Role <span className="text-rose-500">*</span></label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                  >
                    <option value="ROLE_PRODUCTION_STAFF">Staff (Shop Floor)</option>
                    <option value="ROLE_MANAGER">Manager (Operations & Cost)</option>
                    <option value="ROLE_ADMIN">Admin (Full Control)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Initial Temporary Password <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={newInitialPassword}
                    onChange={(e) => setNewInitialPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-600"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                <span className="font-bold">First-Time Login Rule:</span> The new user will sign in with this username and initial password, and will be immediately required to change it to their personal permanent password.
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <div>Seagull Printers &bull; Production Cost Analysis & Stock Management System</div>
      </footer>
    </div>
  );
}
