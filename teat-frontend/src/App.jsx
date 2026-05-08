import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
const API_URL = "http://localhost:5000/api";
const createNotification = async ({ title, message, role }) => {
  try {
    await fetch(`${API_URL}/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title, message, role })
    });
  } catch (error) {
    console.log("Notification create failed:", error.message);
  }
};
import { useEffect, useState } from "react";
import "./App.css";

const defaultProducts = [
  { id: 1, name: "Masala Tea", price: 20, category: "snacks" },
  { id: 2, name: "Ginger Tea", price: 25, category: "snacks" },
  { id: 3, name: "Samosa", price: 20, category: "snacks" },
  { id: 4, name: "Poha", price: 35, category: "breakfast" },
  { id: 5, name: "Idli", price: 40, category: "breakfast" },
  { id: 6, name: "Upma", price: 35, category: "breakfast" }
];

const subscriptionPlans = [
  { name: "Breakfast Only", price: 999, type: "breakfast", features: ["1 breakfast daily", "Valid for 30 days"] },
  { name: "Snacks Only", price: 799, type: "snacks", features: ["1 snacks order daily", "Valid for 30 days"] },
  { name: "Breakfast + Snacks", price: 1499, type: "both", features: ["1 breakfast + 1 snacks daily", "Valid for 30 days"] }
];

function getSaved(key, fallback) {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : fallback;
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/home"), 1500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash">
      <h1>TeaT</h1>
      <p>Tea & Food Delivery App</p>
    </div>
  );
}

function LogoutButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => {
        localStorage.removeItem("teatUserRole");
        navigate("/home");
      }}
    >
      Logout
    </button>
  );
}

function NotificationsBox() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const role = localStorage.getItem("teatUserRole");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${API_URL}/notifications`);
        const data = await response.json();

        if (response.ok) {
          const filtered = data.notifications.filter(
            (item) => item.role === role || item.role === "all"
          );

          setNotifications(filtered);
        }
      } catch (error) {
        console.log("Notifications fetch failed:", error.message);
      }
    };

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 5000);

    return () => clearInterval(interval);
  }, [role]);

  const markRead = async (id) => {
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PUT"
      });

      setNotifications(
        notifications.map((item) =>
          item.id === id ? { ...item, read: true } : item
        )
      );
    } catch (error) {
      console.log("Mark read failed:", error.message);
    }
  };

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div className="bell-wrapper">
      <button className="bell-btn" onClick={() => setOpen(!open)}>
        🔔
        {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="bell-dropdown">
          <h3>Notifications</h3>

          {notifications.length === 0 ? (
            <p>No notifications yet.</p>
          ) : (
            notifications.slice(0, 6).map((item) => (
              <div
                className={`notification-item ${item.read ? "read" : ""}`}
                key={item.id}
              >
                <strong>{item.title}</strong>
                <p>{item.message}</p>

                {!item.read && (
                  <button onClick={() => markRead(item.id)}>Mark Read</button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ProtectedRoute({ children }) {
  const role = localStorage.getItem("teatUserRole");
  return role ? children : <Navigate to="/login" />;
}

function Home() {
  return (
    <div className="app">
      <nav className="navbar">
        <h2>TeaT</h2>
        <Link to="/admin-login" className="admin-top">
          <button>Admin</button>
        </Link>
      </nav>

      <section className="hero">
        <h1>Tea & Food Delivery App</h1>
        <p>Order tea, snacks and breakfast from nearby cafes.</p>

        <div className="hero-buttons">
          <Link to="/login"><button>Login</button></Link>
          <Link to="/signup"><button className="primary">Create Account</button></Link>
        </div>
      </section>
    </div>
  );
}

function Signup({ users, setUsers, setApplications }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
    otp: "",
    password: "",
    role: "customer"
  });

  const [deliveryForm, setDeliveryForm] = useState({
    aadhaar: "",
    pan: "",
    dlNumber: "",
    bankAccount: "",
    ifsc: "",
    smartphone: "yes",
    videoKyc: "completed"
  });

  const [restaurantForm, setRestaurantForm] = useState({
    restaurantName: "",
    legalEntityName: "",
    address: "",
    contactPerson: "",
    phone: "",
    emailId: "",
    gstNumber: "",
    fssaiNumber: "",
    bankAccount: "",
    ifsc: "",
    commission: ""
  });

  const sendOtp = () => {
    if (!form.fullName || !form.mobile || !form.email) {
      alert("Full name, mobile and email required");
      return;
    }

    alert("Demo OTP: 123456");
    setStep(2);
  };

  const verifyOtp = () => {
    if (form.otp !== "123456") {
      alert("Invalid OTP");
      return;
    }

    setStep(3);
  };

  const registerToBackend = async () => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fullName: form.fullName,
        mobile: form.mobile,
        email: form.email,
        password: form.password,
        role: form.role
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Signup failed");
    }

    localStorage.setItem("teatToken", data.token);
    localStorage.setItem("teatUserRole", data.user.role);
    localStorage.setItem("teatUserEmail", data.user.email);

    setUsers((prev) => [data.user, ...prev]);

    return data;
  };

  const continueSignup = async () => {
    try {
      if (!form.password || form.password.length < 6) {
        alert("Password minimum 6 characters required");
        return;
      }

      const data = await registerToBackend();

      if (data.user.role === "customer") {
        navigate("/dashboard");
        return;
      }

      if (data.user.role === "delivery") {
        setStep(4);
        return;
      }

      setStep(5);
    } catch (error) {
      alert(error.message);
    }
  };

  const submitPartnerApplication = (type) => {
    const details = type === "delivery" ? deliveryForm : restaurantForm;

    const application = {
      id: Date.now(),
      type,
      status: "Pending",
      applicant: {
        fullName: form.fullName,
        mobile: form.mobile,
        email: form.email,
        role: form.role
      },
      details,
      submittedAt: new Date().toLocaleString()
    };

    setApplications((prev) => [application, ...prev]);
    navigate("/approval-pending");
  };

  return (
    <div className="form-container">
      <h1>Create Account</h1>

      {step === 1 && (
        <>
          <input
            placeholder="Full Name"
            onChange={(e) =>
              setForm({ ...form, fullName: e.target.value })
            }
          />

          <input
            placeholder="Mobile Number"
            onChange={(e) =>
              setForm({ ...form, mobile: e.target.value })
            }
          />

          <input
            placeholder="Email"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <select
            onChange={(e) =>
              setForm({ ...form, role: e.target.value })
            }
          >
            <option value="customer">Customer</option>
            <option value="delivery">Delivery Partner</option>
            <option value="restaurant">Restaurant Partner</option>
          </select>

          <button className="primary full-btn" onClick={sendOtp}>
            Send OTP
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <p className="small-text">Enter demo OTP: 123456</p>

          <input
            placeholder="Enter OTP"
            onChange={(e) =>
              setForm({ ...form, otp: e.target.value })
            }
          />

          <button className="primary full-btn" onClick={verifyOtp}>
            Verify OTP
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <input
            type="password"
            placeholder="Set Password"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <button className="primary full-btn" onClick={continueSignup}>
            Continue
          </button>
        </>
      )}

      {step === 4 && (
        <>
          <h2>Delivery Partner KYC</h2>

          <input
            placeholder="Aadhaar Number"
            onChange={(e) =>
              setDeliveryForm({ ...deliveryForm, aadhaar: e.target.value })
            }
          />

          <input
            placeholder="PAN Number"
            onChange={(e) =>
              setDeliveryForm({ ...deliveryForm, pan: e.target.value })
            }
          />

          <input
            placeholder="Driving Licence Number"
            onChange={(e) =>
              setDeliveryForm({ ...deliveryForm, dlNumber: e.target.value })
            }
          />

          <input type="file" />

          <input
            placeholder="Bank Account Number"
            onChange={(e) =>
              setDeliveryForm({
                ...deliveryForm,
                bankAccount: e.target.value
              })
            }
          />

          <input
            placeholder="IFSC Code"
            onChange={(e) =>
              setDeliveryForm({ ...deliveryForm, ifsc: e.target.value })
            }
          />

          <select
            onChange={(e) =>
              setDeliveryForm({ ...deliveryForm, smartphone: e.target.value })
            }
          >
            <option value="yes">Smartphone Available</option>
            <option value="no">Smartphone Not Available</option>
          </select>

          <select
            onChange={(e) =>
              setDeliveryForm({ ...deliveryForm, videoKyc: e.target.value })
            }
          >
            <option value="completed">Live Video KYC Completed</option>
            <option value="pending">Live Video KYC Pending</option>
          </select>

          <button
            className="primary full-btn"
            onClick={() => submitPartnerApplication("delivery")}
          >
            Submit for Admin Approval
          </button>
        </>
      )}

      {step === 5 && (
        <>
          <h2>Restaurant Partner Form</h2>

          <input
            placeholder="Restaurant Name"
            onChange={(e) =>
              setRestaurantForm({
                ...restaurantForm,
                restaurantName: e.target.value
              })
            }
          />

          <input
            placeholder="Legal Entity Name"
            onChange={(e) =>
              setRestaurantForm({
                ...restaurantForm,
                legalEntityName: e.target.value
              })
            }
          />

          <input
            placeholder="Address"
            onChange={(e) =>
              setRestaurantForm({
                ...restaurantForm,
                address: e.target.value
              })
            }
          />

          <input
            placeholder="Contact Person"
            onChange={(e) =>
              setRestaurantForm({
                ...restaurantForm,
                contactPerson: e.target.value
              })
            }
          />

          <input
            placeholder="Phone"
            onChange={(e) =>
              setRestaurantForm({
                ...restaurantForm,
                phone: e.target.value
              })
            }
          />

          <input
            placeholder="Email ID"
            onChange={(e) =>
              setRestaurantForm({
                ...restaurantForm,
                emailId: e.target.value
              })
            }
          />

          <input
            placeholder="GST Number"
            onChange={(e) =>
              setRestaurantForm({
                ...restaurantForm,
                gstNumber: e.target.value
              })
            }
          />

          <input
            placeholder="FSSAI Number"
            onChange={(e) =>
              setRestaurantForm({
                ...restaurantForm,
                fssaiNumber: e.target.value
              })
            }
          />

          <input
            placeholder="Bank Account Number"
            onChange={(e) =>
              setRestaurantForm({
                ...restaurantForm,
                bankAccount: e.target.value
              })
            }
          />

          <input
            placeholder="IFSC Code"
            onChange={(e) =>
              setRestaurantForm({
                ...restaurantForm,
                ifsc: e.target.value
              })
            }
          />

          <input
            placeholder="Commission %"
            onChange={(e) =>
              setRestaurantForm({
                ...restaurantForm,
                commission: e.target.value
              })
            }
          />

          <input type="file" />

          <button
            className="primary full-btn"
            onClick={() => submitPartnerApplication("restaurant")}
          >
            Submit for Admin Approval
          </button>
        </>
      )}
    </div>
  );
}

function ApprovalPending() {
  return (
    <div className="dashboard center">
      <h1>Application Submitted</h1>
      <p>Your partner account is pending admin approval.</p>
      <Link to="/home"><button className="primary">Go Home</button></Link>
    </div>
  );
}

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "customer"
  });

  const login = async () => {
    try {
      if (!form.email || !form.password) {
        alert("Email and password required");
        return;
      }

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          role: form.role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("teatToken", data.token);
      localStorage.setItem("teatUserRole", data.user.role);
      localStorage.setItem("teatUserEmail", data.user.email);

      alert("Login successful");

      navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="form-container">
      <h1>Login</h1>

      <input
        placeholder="Email"
        onChange={(e) =>
          setForm({ ...form, email: e.target.value })
        }
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) =>
          setForm({ ...form, password: e.target.value })
        }
      />

      <select
        onChange={(e) =>
          setForm({ ...form, role: e.target.value })
        }
      >
        <option value="customer">Customer</option>
        <option value="delivery">Delivery Partner</option>
        <option value="restaurant">Restaurant Partner</option>
      </select>

      <button className="primary full-btn" onClick={login}>
        Login
      </button>
    </div>
  );
}

function AdminLogin() {
  const navigate = useNavigate();

  return (
    <div className="form-container">
      <h1>Admin Login</h1>
      <input placeholder="Admin Email" />
      <input type="password" placeholder="Admin Password" />
      <button
        className="primary full-btn"
        onClick={() => {
          localStorage.setItem("teatUserRole", "admin");
          navigate("/admin");
        }}
      >
        Login as Admin
      </button>
      <p className="small-text">Demo admin login</p>
    </div>
  );
}

function CustomerDashboard({
  products,
  cart,
  setCart,
  orders,
  setOrders,
  customerSubscription,
  setCustomerSubscription,
  addresses,
  setAddresses
}) {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString();
  const [dailyUsage, setDailyUsage] = useState(getSaved("teatDailyUsage", { date: today, breakfast: 0, snacks: 0 }));
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    if (dailyUsage.date !== today) {
      setDailyUsage({ date: today, breakfast: 0, snacks: 0 });
    }
  }, [dailyUsage.date, today]);

  useEffect(() => save("teatDailyUsage", dailyUsage), [dailyUsage]);

  const activeSub =
    customerSubscription &&
    customerSubscription.status === "active" &&
    new Date(customerSubscription.expiryDate) > new Date();

  const canUseSub = (item) => {
    if (!activeSub) return false;
    if (customerSubscription.type === "both") {
      return item.category === "breakfast" ? dailyUsage.breakfast < 1 : dailyUsage.snacks < 1;
    }
    return item.category === customerSubscription.type && dailyUsage[item.category] < 1;
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const subscriptionDiscount = cart.reduce((sum, item) => {
    if (canUseSub(item)) return sum + item.price;
    return sum;
  }, 0);

  const payable = Math.max(cartTotal - subscriptionDiscount, 0);

  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(cart.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const buyPlan = () => {
    if (!selectedPlan) return alert("Select a plan first");

    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(startDate.getDate() + 30);

    const subscription = {
      ...selectedPlan,
      status: "active",
      paymentStatus: "paid",
      startDate: startDate.toLocaleDateString(),
      expiryDate: expiryDate.toLocaleDateString()
    };

    setCustomerSubscription(subscription);
    setSelectedPlan(null);
    alert(`${subscription.name} activated for 30 days`);
  };

  return (
    <div className="dashboard">
      
      <div className="dashboard-header">
        
        <div>
          <h1>Customer Dashboard</h1>
          <p>Order breakfast, snacks and tea.</p>
          {activeSub && <p>Active Plan: {customerSubscription.name} | Valid till: {customerSubscription.expiryDate}</p>}
          {activeSub && <p>Today Used: Breakfast {dailyUsage.breakfast}/1 | Snacks {dailyUsage.snacks}/1</p>}
        </div>
        <LogoutButton />
      </div>
      <div className="header-right">
  <NotificationsBox />
  <LogoutButton />
</div>

      <div className="dashboard-actions">
        <Link to="/profile"><button>Profile</button></Link>
        <Link to="/cart"><button className="primary">Cart ({cart.reduce((s, i) => s + i.qty, 0)})</button></Link>
        <Link to="/orders"><button>Orders</button></Link>
      </div>

      <h2 className="section-title">Monthly Subscription Plans</h2>
      <div className="dashboard-cards">
        {subscriptionPlans.map((plan) => (
          <div className={`dashboard-card ${customerSubscription?.name === plan.name ? "selected-plan" : ""}`} key={plan.name}>
            <h3>{plan.name}</h3>
            <p>₹{plan.price}/month</p>
            {plan.features.map((f) => <p key={f}>{f}</p>)}
            <button className="primary" onClick={() => setSelectedPlan(plan)}>Buy Plan</button>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className="order-list">
          <div className="order-card">
            <h3>Confirm Subscription Payment</h3>
            <p>Plan: {selectedPlan.name}</p>
            <p>Amount: ₹{selectedPlan.price}</p>
            <button className="primary" onClick={buyPlan}>Confirm Payment</button>
            <button onClick={() => setSelectedPlan(null)}>Cancel</button>
          </div>
        </div>
      )}

      <h2 className="section-title">Available Items</h2>
      <div className="dashboard-cards">
        {products.map((product) => (
          <div className="dashboard-card" key={product.id}>
            <h3>{product.name}</h3>
            <p>₹{product.price}</p>
            <p>{product.category}</p>

            <p>
  Status:{" "}
  <strong>{product.inStock === false ? "Out of Stock" : "In Stock"}</strong>
</p>
            {canUseSub(product) && <p>✅ Subscription available today</p>}
            {product.inStock === false ? (
  <button disabled>Out of Stock</button>
) : (
  <button className="primary" onClick={() => addToCart(product)}>
    Add to Cart
  </button>
)}
          </div>
        ))}
      </div>

      <div className="summary-box">
        <h3>Cart Summary</h3>
        <p>Total: ₹{cartTotal}</p>
        <p>Subscription Discount: ₹{subscriptionDiscount}</p>
        <p>Payable: ₹{payable}</p>
        <button className="primary" onClick={() => navigate("/cart")}>Go to Cart</button>
      </div>
    </div>
  );
}

function CartPage({ cart, setCart }) {
  const navigate = useNavigate();

  const updateQty = (id, delta) => {
    setCart(
      cart
        .map((item) => item.id === id ? { ...item, qty: item.qty + delta } : item)
        .filter((item) => item.qty > 0)
    );
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Your Cart</h1>
          <p>Total: ₹{total}</p>
        </div>
        <button onClick={() => navigate("/dashboard")}>Back</button>
      </div>

      {cart.length === 0 ? <p>Cart is empty.</p> : (
        <div className="order-list">
          {cart.map((item) => (
            <div className="order-card" key={item.id}>
              <h3>{item.name}</h3>
              <p>₹{item.price} × {item.qty}</p>
              <button onClick={() => updateQty(item.id, -1)}>-</button>
              <button className="primary" onClick={() => updateQty(item.id, 1)}>+</button>
              <button onClick={() => setCart(cart.filter((p) => p.id !== item.id))}>Remove</button>
            </div>
          ))}
          <button className="primary" onClick={() => navigate("/checkout")}>Checkout</button>
          <button onClick={() => setCart([])}>Clear Cart</button>
        </div>
      )}
    </div>
  );
}

function CheckoutPage({
  cart,
  setCart,
  orders,
  setOrders,
  customerSubscription,
  addresses,
  setAddresses
}) {
  const navigate = useNavigate();

  const [address, setAddress] = useState(addresses[0] || "");
  const [payment, setPayment] = useState("Cash on Delivery");
  const [location, setLocation] = useState(null);

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = cart.length > 0 ? 20 : 0;
  const payable = total + deliveryFee;

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("GPS location not supported in this browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const gpsData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        setLocation(gpsData);

        setAddress(
          `${address ? address + " | " : ""}GPS: ${gpsData.latitude}, ${gpsData.longitude}`
        );

        alert("GPS location added successfully");
      },
      () => {
        alert("Location permission denied");
      }
    );
  };

  const placeOrder = async () => {
    try {
      if (!address) {
        alert("Enter delivery address");
        return;
      }

      if (cart.length === 0) {
        alert("Cart is empty");
        return;
      }

      if (!addresses.includes(address)) {
        setAddresses([address, ...addresses]);
      }

      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          items: cart,
          totalAmount: payable,
          deliveryFee,
          paymentMode: payment,
          address,
          location
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Order create failed");
      }

      setOrders([data.order, ...orders]);
      setCart([]);

      await createNotification({
        title: "New Order Placed",
        message: `New order #${data.order.id} received`,
        role: "restaurant"
      });

      alert("Order placed successfully");
      navigate("/orders");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Checkout</h1>
          <p>Review address, GPS location and payment.</p>
        </div>

        <button onClick={() => navigate("/cart")}>Back</button>
      </div>

      <div className="form-container">
        <h2>Delivery Address</h2>

        <input
          value={address}
          placeholder="Enter delivery address"
          onChange={(e) => setAddress(e.target.value)}
        />

        <button className="full-btn" onClick={getCurrentLocation}>
          Use Current GPS Location
        </button>

        {location && (
          <p className="small-text">
            GPS Added: {location.latitude}, {location.longitude}
          </p>
        )}

        <h2>Payment Method</h2>

        <select value={payment} onChange={(e) => setPayment(e.target.value)}>
          <option>Cash on Delivery</option>
          <option>UPI</option>
          <option>Card</option>
        </select>

        <h2>Order Summary</h2>

        {cart.map((item) => (
          <p key={item.id}>
            {item.name} × {item.qty} = ₹{item.price * item.qty}
          </p>
        ))}

        <p>Items Total: ₹{total}</p>
        <p>Delivery Fee: ₹{deliveryFee}</p>
        <h3>Payable: ₹{payable}</h3>

        <button className="primary full-btn" onClick={placeOrder}>
          Place Order
        </button>
      </div>
    </div>
  );
}

function OrdersPage({ orders, setOrders }) {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${API_URL}/orders`);
        const data = await response.json();

        if (response.ok) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.log("Order tracking fetch failed:", error.message);
      }
    };

    fetchOrders();

    const interval = setInterval(fetchOrders, 5000);

    return () => clearInterval(interval);
  }, [setOrders]);

  const cancelOrder = async (orderId) => {
    try {
      const confirmCancel = window.confirm(
        "Are you sure you want to cancel this order?"
      );

      if (!confirmCancel) return;

      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: "Cancelled"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Order cancel failed");
      }

      setOrders(
        orders.map((order) =>
          order.id === orderId ? data.order : order
        )
      );

      await createNotification({
        title: "Order Cancelled",
        message: `Order #${orderId} has been cancelled by customer`,
        role: "restaurant"
      });

      alert("Order cancelled successfully");
    } catch (error) {
      alert(error.message);
    }
  };

  const getTrackingStep = (order) => {
    if (order.status === "Cancelled") return 0;
    if (order.deliveryStatus === "Delivered") return 5;
    if (order.deliveryStatus === "Picked Up") return 4;
    if (order.status === "Ready for Pickup") return 3;
    if (order.status === "Accepted") return 2;
    return 1;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Live Order Tracking</h1>
          <p>Order status updates every 5 seconds.</p>
        </div>

        <button onClick={() => navigate("/dashboard")}>Back</button>
      </div>

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div className="order-list">
          {orders.map((order) => {
            const step = getTrackingStep(order);

            return (
              <div className="order-card" key={order.id}>
                <h3>Order #{order.id}</h3>

                <p>Total: ₹{order.totalAmount}</p>
                <p>Payment: {order.paymentMode}</p>
                <p>Restaurant Status: {order.status}</p>
                <p>Delivery Status: {order.deliveryStatus}</p>
                <p>Address: {order.address}</p>

                {order.deliveryOtp && order.status !== "Cancelled" && (
                  <p>
                    Delivery OTP: <strong>{order.deliveryOtp}</strong>
                  </p>
                )}

                {order.status === "Placed" && (
                  <button onClick={() => cancelOrder(order.id)}>
                    Cancel Order
                  </button>
                )}

                {order.status === "Cancelled" ? (
                  <div className="tracking-box">
                    <div className="track-step cancelled">
                      ❌ Cancelled
                    </div>
                  </div>
                ) : (
                  <div className="tracking-box">
                    <div className={step >= 1 ? "track-step active" : "track-step"}>
                      ✅ Placed
                    </div>

                    <div className={step >= 2 ? "track-step active" : "track-step"}>
                      🍽️ Accepted
                    </div>

                    <div className={step >= 3 ? "track-step active" : "track-step"}>
                      📦 Ready
                    </div>

                    <div className={step >= 4 ? "track-step active" : "track-step"}>
                      🛵 Picked Up
                    </div>

                    <div className={step >= 5 ? "track-step active" : "track-step"}>
                      🏠 Delivered
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProfilePage({ users, addresses, setAddresses, customerSubscription }) {
  const navigate = useNavigate();
  const email = localStorage.getItem("teatUserEmail");
  const role = localStorage.getItem("teatUserRole");
  const user = users.find((u) => u.email === email) || { fullName: "Demo User", email, mobile: "Not added" };
  const [newAddress, setNewAddress] = useState("");

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Profile</h1>
          <p>{role}</p>
        </div>
        <button onClick={() => navigate("/dashboard")}>Back</button>
      </div>

      <div className="order-list">
        <div className="order-card">
          <h3>{user.fullName}</h3>
          <p>Email: {user.email}</p>
          <p>Mobile: {user.mobile}</p>
          {customerSubscription && <p>Subscription: {customerSubscription.name} ({customerSubscription.status})</p>}
        </div>

        <div className="order-card">
          <h3>Saved Addresses</h3>
          <input value={newAddress} placeholder="Add new address" onChange={(e) => setNewAddress(e.target.value)} />
          <button className="primary" onClick={() => {
            if (newAddress) {
              setAddresses([newAddress, ...addresses]);
              setNewAddress("");
            }
          }}>Add Address</button>

          {addresses.map((addr, index) => <p key={index}>{addr}</p>)}
        </div>
      </div>
    </div>
  );
}

function DeliveryDashboard({ orders, setOrders }) {
  const [online, setOnline] = useState(false);
  const [otpInputs, setOtpInputs] = useState({});

  const deliveryProfile = {
    name: localStorage.getItem("teatUserName") || "Delivery Partner",
    email: localStorage.getItem("teatUserEmail") || "Not available",
    mobile: localStorage.getItem("teatUserMobile") || "Not available",
    kycStatus: "Approved",
    vehicle: "Bike",
    dlStatus: "Verified",
    bankStatus: "Added"
  };

  const availableOrders = orders.filter(
    (order) => order.deliveryStatus === "Available"
  );

  const myOrders = orders.filter((order) =>
    ["Accepted", "Picked Up"].includes(order.deliveryStatus)
  );

  const delivered = orders.filter(
    (order) => order.deliveryStatus === "Delivered"
  );

  const earnings = delivered.reduce(
    (sum, order) => sum + Number(order.deliveryFee || 0),
    0
  );

  const updateDeliveryStatus = async (id, deliveryStatus) => {
    try {
      const bodyData = { deliveryStatus };

      if (deliveryStatus === "Delivered") {
        const enteredOtp = otpInputs[id];

        if (!enteredOtp) {
          alert("Customer delivery OTP required");
          return;
        }

        bodyData.deliveryOtp = enteredOtp;
      }

      const response = await fetch(`${API_URL}/orders/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bodyData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Delivery update failed");
      }

      setOrders(
        orders.map((order) =>
          order.id === id ? data.order : order
        )
      );

      if (deliveryStatus === "Accepted") {
        await createNotification({
          title: "Delivery Accepted",
          message: `Delivery partner accepted order #${id}`,
          role: "customer"
        });
      }

      if (deliveryStatus === "Picked Up") {
        await createNotification({
          title: "Order Picked Up",
          message: `Your order #${id} has been picked up`,
          role: "customer"
        });
      }

      if (deliveryStatus === "Delivered") {
        await createNotification({
          title: "Order Delivered",
          message: `Your order #${id} has been delivered successfully`,
          role: "customer"
        });
      }

      alert(`Order ${deliveryStatus}`);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Delivery Dashboard</h1>
          <p>{online ? "Online" : "Offline"}</p>
        </div>

        <LogoutButton />
      </div>

      <div className="header-right">
  <NotificationsBox />
  <LogoutButton />
</div>

      <h2 className="section-title">Delivery Partner Profile</h2>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>{deliveryProfile.name}</h3>
          <p>Email: {deliveryProfile.email}</p>
          <p>Mobile: {deliveryProfile.mobile}</p>
        </div>

        <div className="dashboard-card">
          <h3>KYC Status</h3>
          <p>{deliveryProfile.kycStatus}</p>
          <p>DL: {deliveryProfile.dlStatus}</p>
          <p>Bank: {deliveryProfile.bankStatus}</p>
        </div>

        <div className="dashboard-card">
          <h3>Vehicle</h3>
          <p>{deliveryProfile.vehicle}</p>
          <p>Smartphone: Yes</p>
        </div>

        <div className="dashboard-card">
          <h3>Performance</h3>
          <p>Completed: {delivered.length}</p>
          <p>Rating: ⭐ 4.8</p>
          <p>Earnings: ₹{earnings}</p>
        </div>
      </div>

      <div className="dashboard-actions">
        <button
          className={online ? "primary" : ""}
          onClick={() => setOnline(!online)}
        >
          {online ? "Go Offline" : "Go Online"}
        </button>
      </div>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Earnings</h3>
          <p>₹{earnings}</p>
        </div>

        <div className="dashboard-card">
          <h3>Available</h3>
          <p>{availableOrders.length}</p>
        </div>

        <div className="dashboard-card">
          <h3>Delivered</h3>
          <p>{delivered.length}</p>
        </div>

        <div className="dashboard-card">
          <h3>Active Orders</h3>
          <p>{myOrders.length}</p>
        </div>
      </div>

      <h2 className="section-title">Available Orders</h2>

      <div className="order-list">
        {availableOrders.length === 0 ? (
          <p>No available orders.</p>
        ) : (
          availableOrders.map((order) => (
            <div className="order-card" key={order.id}>
              <h3>Order #{order.id}</h3>
              <p>Total: ₹{order.totalAmount}</p>
              <p>Delivery Fee: ₹{order.deliveryFee}</p>
              <p>Address: {order.address}</p>

              {order.location && (
                <p>
                  GPS: {order.location.latitude}, {order.location.longitude}
                </p>
              )}

              <button
                className="primary"
                onClick={() => updateDeliveryStatus(order.id, "Accepted")}
              >
                Accept
              </button>

              <button onClick={() => updateDeliveryStatus(order.id, "Rejected")}>
                Reject
              </button>
            </div>
          ))
        )}
      </div>

      <h2 className="section-title">My Deliveries</h2>

      <div className="order-list">
        {myOrders.length === 0 ? (
          <p>No accepted deliveries.</p>
        ) : (
          myOrders.map((order) => (
            <div className="order-card" key={order.id}>
              <h3>Order #{order.id}</h3>
              <p>Status: {order.deliveryStatus}</p>
              <p>Address: {order.address}</p>
              <p>Delivery Fee: ₹{order.deliveryFee}</p>

              {order.location && (
                <p>
                  GPS: {order.location.latitude}, {order.location.longitude}
                </p>
              )}

              <button
                className="primary"
                onClick={() => updateDeliveryStatus(order.id, "Picked Up")}
              >
                Picked Up
              </button>

              <input
                placeholder="Enter customer delivery OTP"
                value={otpInputs[order.id] || ""}
                onChange={(e) =>
                  setOtpInputs({
                    ...otpInputs,
                    [order.id]: e.target.value
                  })
                }
              />

              <button onClick={() => updateDeliveryStatus(order.id, "Delivered")}>
                Delivered with OTP
              </button>
            </div>
          ))
        )}
      </div>

      <h2 className="section-title">Delivery History</h2>

      <div className="order-list">
        {delivered.length === 0 ? (
          <p>No delivered orders yet.</p>
        ) : (
          delivered.map((order) => (
            <div className="order-card" key={order.id}>
              <h3>Order #{order.id}</h3>
              <p>Status: {order.deliveryStatus}</p>
              <p>OTP Verified: {order.deliveryOtpVerified ? "Yes" : "No"}</p>
              <p>Earned: ₹{order.deliveryFee}</p>
              <p>Address: {order.address}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function RestaurantDashboard({ products, setProducts, orders, setOrders }) {
  const [open, setOpen] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    category: "snacks",
    inStock: true
  });

  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.totalAmount || 0),
    0
  );

  const saveProduct = async () => {
    try {
      if (!productForm.name || !productForm.price) {
        alert("Product name and price required");
        return;
      }

      const productData = {
        name: productForm.name,
        price: Number(productForm.price),
        category: productForm.category,
        inStock: productForm.inStock
      };

      if (editingId) {
        const response = await fetch(`${API_URL}/products/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Product update failed");
        }

        setProducts(
          products.map((product) =>
            product.id === editingId ? data.product : product
          )
        );

        setEditingId(null);
        alert("Product updated successfully");
      } else {
        const response = await fetch(`${API_URL}/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Product create failed");
        }

        setProducts([data.product, ...products]);
        alert("Product added successfully");
      }

      setProductForm({
        name: "",
        price: "",
        category: "snacks",
        inStock: true
      });
    } catch (error) {
      alert(error.message);
    }
  };

  const editProduct = (product) => {
    setEditingId(product.id);

    setProductForm({
      name: product.name,
      price: product.price,
      category: product.category,
      inStock: product.inStock !== false
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleStock = async (product) => {
    try {
      const response = await fetch(`${API_URL}/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inStock: !product.inStock
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Stock update failed");
      }

      setProducts(
        products.map((item) =>
          item.id === product.id ? data.product : item
        )
      );

      alert(data.product.inStock ? "Product is now In Stock" : "Product is now Out of Stock");
    } catch (error) {
      alert(error.message);
    }
  };

  const deleteProduct = async (id) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this product?"
      );

      if (!confirmDelete) return;

      const response = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Product delete failed");
      }

      setProducts(products.filter((product) => product.id !== id));
      alert("Product deleted successfully");
    } catch (error) {
      alert(error.message);
    }
  };

  const updateOrder = async (id, status) => {
    try {
      const response = await fetch(`${API_URL}/orders/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Order update failed");
      }

      setOrders(
        orders.map((order) =>
          order.id === id ? data.order : order
        )
      );

      if (status === "Accepted") {
        await createNotification({
          title: "Order Accepted",
          message: `Your order #${id} has been accepted by restaurant`,
          role: "customer"
        });
      }

      if (status === "Ready for Pickup") {
        await createNotification({
          title: "Order Ready",
          message: `Order #${id} is ready for pickup`,
          role: "delivery"
        });
      }

      alert(`Order ${status}`);
    } catch (error) {
      alert(error.message);
    }
  };

  const inStockCount = products.filter((p) => p.inStock !== false).length;
  const outStockCount = products.filter((p) => p.inStock === false).length;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Restaurant Dashboard</h1>
          <p>{open ? "Restaurant is open" : "Restaurant is closed"}</p>
        </div>

        <div className="header-right">
          <NotificationsBox />
          <LogoutButton />
        </div>
      </div>

      <h2 className="section-title">Restaurant Partner Profile</h2>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Documents</h3>
          <p>GST: Verified</p>
          <p>FSSAI: Verified</p>
          <p>Bank: Added</p>
        </div>

        <div className="dashboard-card">
          <h3>Timings</h3>
          <p>Open: 08:00 AM</p>
          <p>Close: 10:00 PM</p>
          <p>Status: {open ? "Open" : "Closed"}</p>
        </div>

        <div className="dashboard-card">
          <h3>Menu Stock</h3>
          <p>In Stock: {inStockCount}</p>
          <p>Out of Stock: {outStockCount}</p>
        </div>

        <div className="dashboard-card">
          <h3>Payout</h3>
          <p>Total Revenue: ₹{totalRevenue}</p>
          <p>Menu Items: {products.length}</p>
        </div>
      </div>

      <div className="dashboard-actions">
        <button
          className={open ? "primary" : ""}
          onClick={() => setOpen(!open)}
        >
          {open ? "Close Restaurant" : "Open Restaurant"}
        </button>
      </div>

      <h2 className="section-title">
        {editingId ? "Edit Product" : "Add Product"}
      </h2>

      <div className="form-container small-form">
        <input
          placeholder="Product Name"
          value={productForm.name}
          onChange={(e) =>
            setProductForm({ ...productForm, name: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Price"
          value={productForm.price}
          onChange={(e) =>
            setProductForm({ ...productForm, price: e.target.value })
          }
        />

        <select
          value={productForm.category}
          onChange={(e) =>
            setProductForm({ ...productForm, category: e.target.value })
          }
        >
          <option value="breakfast">Breakfast</option>
          <option value="snacks">Snacks</option>
        </select>

        <select
          value={productForm.inStock ? "true" : "false"}
          onChange={(e) =>
            setProductForm({
              ...productForm,
              inStock: e.target.value === "true"
            })
          }
        >
          <option value="true">In Stock</option>
          <option value="false">Out of Stock</option>
        </select>

        <button className="primary full-btn" onClick={saveProduct}>
          {editingId ? "Update Product" : "Add Product"}
        </button>

        {editingId && (
          <button
            className="full-btn"
            onClick={() => {
              setEditingId(null);
              setProductForm({
                name: "",
                price: "",
                category: "snacks",
                inStock: true
              });
            }}
          >
            Cancel Edit
          </button>
        )}
      </div>

      <h2 className="section-title">Menu</h2>

      <div className="dashboard-cards">
        {products.length === 0 ? (
          <p>No products added yet.</p>
        ) : (
          products.map((product) => (
            <div className="dashboard-card" key={product.id}>
              <h3>{product.name}</h3>
              <p>₹{product.price}</p>
              <p>{product.category}</p>
              <p>
                Status:{" "}
                <strong>
                  {product.inStock === false ? "Out of Stock" : "In Stock"}
                </strong>
              </p>

              <button
                className="primary"
                onClick={() => editProduct(product)}
              >
                Edit
              </button>

              <button onClick={() => toggleStock(product)}>
                {product.inStock === false ? "Mark In Stock" : "Mark Out of Stock"}
              </button>

              <button onClick={() => deleteProduct(product.id)}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      <h2 className="section-title">Orders</h2>

      <div className="order-list">
        {orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          orders.map((order) => (
            <div className="order-card" key={order.id}>
              <h3>Order #{order.id}</h3>
              <p>Total: ₹{order.totalAmount}</p>
              <p>Status: {order.status}</p>
              <p>Delivery: {order.deliveryStatus}</p>
              <p>Address: {order.address}</p>

              {order.location && (
                <p>
                  GPS: {order.location.latitude}, {order.location.longitude}
                </p>
              )}

              <button
                className="primary"
                onClick={() => updateOrder(order.id, "Accepted")}
              >
                Accept
              </button>

              <button onClick={() => updateOrder(order.id, "Rejected")}>
                Reject
              </button>

              <button onClick={() => updateOrder(order.id, "Ready for Pickup")}>
                Ready
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AdminPanel({
  users,
  products,
  orders,
  applications,
  setApplications,
  customerSubscription
}) {
  const totalSales = orders.reduce(
    (sum, order) => sum + Number(order.totalAmount || 0),
    0
  );

  const deliveryApps = applications.filter((a) => a.type === "delivery");
  const restaurantApps = applications.filter((a) => a.type === "restaurant");

  const customers = users.filter((user) => user.role === "customer");
  const deliveryPartners = users.filter((user) => user.role === "delivery");
  const restaurants = users.filter((user) => user.role === "restaurant");

  const approvedPartners = users.filter(
    (user) =>
      (user.role === "delivery" || user.role === "restaurant") &&
      user.status === "approved"
  );

  const pendingPartners = users.filter(
    (user) =>
      (user.role === "delivery" || user.role === "restaurant") &&
      user.status === "pending"
  );

  const deliveredOrders = orders.filter(
    (order) => order.deliveryStatus === "Delivered"
  );

  const activeOrders = orders.filter(
    (order) => order.deliveryStatus !== "Delivered"
  );

  const adminProfile = {
    name: "TeaT Admin",
    email: "admin@teat.com",
    role: "Super Admin",
    platformStatus: "Active"
  };

  const approve = async (app) => {
    try {
      const response = await fetch(`${API_URL}/admin/approve-partner`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: app.applicant.email,
          role: app.type
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Approval failed");
      }

      localStorage.setItem(
        `teatApproved_${app.applicant.email}_${app.type}`,
        "approved"
      );

      setApplications(
        applications.map((a) =>
          a.id === app.id ? { ...a, status: "Approved" } : a
        )
      );

      await createNotification({
        title: "Partner Approved",
        message: `${app.applicant.fullName} approved as ${app.type}`,
        role: "admin"
      });

      alert("Partner approved successfully");
    } catch (error) {
      alert(error.message);
    }
  };

  const reject = async (app) => {
    try {
      const response = await fetch(`${API_URL}/admin/reject-partner`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: app.applicant.email,
          role: app.type
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Reject failed");
      }

      setApplications(
        applications.map((a) =>
          a.id === app.id ? { ...a, status: "Rejected" } : a
        )
      );

      await createNotification({
        title: "Partner Rejected",
        message: `${app.applicant.fullName} rejected as ${app.type}`,
        role: "admin"
      });

      alert("Partner rejected successfully");
    } catch (error) {
      alert(error.message);
    }
  };

  const renderApps = (title, list) => (
    <>
      <h2 className="section-title">{title}</h2>

      <div className="order-list">
        {list.length === 0 ? (
          <p>No applications.</p>
        ) : (
          list.map((app) => (
            <div className="order-card" key={app.id}>
              <h3>{app.type.toUpperCase()} Application</h3>
              <p>Name: {app.applicant.fullName}</p>
              <p>Email: {app.applicant.email}</p>
              <p>Mobile: {app.applicant.mobile}</p>
              <p>Status: {app.status}</p>
              <p>Submitted: {app.submittedAt}</p>

              {app.status === "Pending" && (
                <>
                  <button className="primary" onClick={() => approve(app)}>
                    Approve
                  </button>

                  <button onClick={() => reject(app)}>
                    Reject
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );

  const renderUsers = (title, list) => (
    <>
      <h2 className="section-title">{title}</h2>

      <div className="order-list">
        {list.length === 0 ? (
          <p>No users found.</p>
        ) : (
          list.map((user) => (
            <div className="order-card" key={user.id || user.email}>
              <h3>{user.fullName || "Unnamed User"}</h3>
              <p>Email: {user.email}</p>
              <p>Mobile: {user.mobile || "Not available"}</p>
              <p>Role: {user.role}</p>
              <p>Status: {user.status}</p>
            </div>
          ))
        )}
      </div>
    </>
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Users, partners, orders, subscriptions and platform control.</p>
        </div>

        <LogoutButton />
      </div>

      <div className="header-right">
  <NotificationsBox />
  <LogoutButton />
</div>

      <h2 className="section-title">Admin Profile</h2>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>{adminProfile.name}</h3>
          <p>Email: {adminProfile.email}</p>
          <p>Role: {adminProfile.role}</p>
        </div>

        <div className="dashboard-card">
          <h3>Platform Status</h3>
          <p>{adminProfile.platformStatus}</p>
          <p>Total Users: {users.length}</p>
        </div>

        <div className="dashboard-card">
          <h3>Partner Status</h3>
          <p>Pending: {pendingPartners.length}</p>
          <p>Approved: {approvedPartners.length}</p>
        </div>

        <div className="dashboard-card">
          <h3>Revenue</h3>
          <p>Sales: ₹{totalSales}</p>
          <p>
            Subscription: ₹
            {customerSubscription?.status === "active"
              ? customerSubscription.price
              : 0}
          </p>
        </div>
      </div>

      <h2 className="section-title">Platform Overview</h2>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Customers</h3>
          <p>{customers.length}</p>
        </div>

        <div className="dashboard-card">
          <h3>Delivery Partners</h3>
          <p>{deliveryPartners.length}</p>
        </div>

        <div className="dashboard-card">
          <h3>Restaurants</h3>
          <p>{restaurants.length}</p>
        </div>

        <div className="dashboard-card">
          <h3>Products</h3>
          <p>{products.length}</p>
        </div>

        <div className="dashboard-card">
          <h3>Total Orders</h3>
          <p>{orders.length}</p>
        </div>

        <div className="dashboard-card">
          <h3>Active Orders</h3>
          <p>{activeOrders.length}</p>
        </div>

        <div className="dashboard-card">
          <h3>Delivered Orders</h3>
          <p>{deliveredOrders.length}</p>
        </div>

        <div className="dashboard-card">
          <h3>Total Sales</h3>
          <p>₹{totalSales}</p>
        </div>
      </div>

      <h2 className="section-title">Customer Subscription</h2>

      <div className="order-list">
        {customerSubscription ? (
          <div className="order-card">
            <h3>{customerSubscription.name}</h3>
            <p>Status: {customerSubscription.status}</p>
            <p>Amount: ₹{customerSubscription.price}</p>
            <p>Start: {customerSubscription.startDate}</p>
            <p>Expiry: {customerSubscription.expiryDate}</p>
            <p>Payment: {customerSubscription.paymentStatus || "N/A"}</p>
          </div>
        ) : (
          <p>No active subscription.</p>
        )}
      </div>

      {renderApps("Delivery Partner Applications", deliveryApps)}
      {renderApps("Restaurant Partner Applications", restaurantApps)}

      {renderUsers("Customers", customers)}
      {renderUsers("Delivery Partners", deliveryPartners)}
      {renderUsers("Restaurant Partners", restaurants)}

      <h2 className="section-title">All Orders</h2>

      <div className="order-list">
        {orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          orders.map((order) => (
            <div className="order-card" key={order.id}>
              <h3>Order #{order.id}</h3>
              <p>Total: ₹{order.totalAmount}</p>
              <p>Payment: {order.paymentMode}</p>
              <p>Restaurant Status: {order.status}</p>
              <p>Delivery Status: {order.deliveryStatus}</p>
              <p>Address: {order.address}</p>

              {order.location && (
                <p>
                  GPS: {order.location.latitude}, {order.location.longitude}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Dashboard(props) {
  const role = localStorage.getItem("teatUserRole") || "customer";

  if (role === "delivery") return <DeliveryDashboard orders={props.orders} setOrders={props.setOrders} />;
  if (role === "restaurant") return <RestaurantDashboard products={props.products} setProducts={props.setProducts} orders={props.orders} setOrders={props.setOrders} />;

  return <CustomerDashboard {...props} />;
}

function App() {
  const [users, setUsers] = useState(() => getSaved("teatUsers", []));
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => getSaved("teatCart", []));
  const [orders, setOrders] = useState(() => getSaved("teatOrders", []));
  const [applications, setApplications] = useState(() => getSaved("teatApplications", []));
  const [addresses, setAddresses] = useState(() => getSaved("teatAddresses", []));
  const [customerSubscription, setCustomerSubscription] = useState(() => getSaved("teatCustomerSubscription", null));

  useEffect(() => save("teatUsers", users), [users]);
  useEffect(() => {
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();

      if (response.ok) {
        if (data.products.length > 0) {
          setProducts(data.products);
        } else {
          setProducts(defaultProducts);
        }
      }
    } catch (error) {
      console.log("Products fetch failed:", error.message);
      setProducts(defaultProducts);
    }
  };

  fetchProducts();
}, []);
  useEffect(() => save("teatCart", cart), [cart]);
  useEffect(() => save("teatOrders", orders), [orders]);
  useEffect(() => save("teatApplications", applications), [applications]);
  useEffect(() => save("teatAddresses", addresses), [addresses]);
  useEffect(() => save("teatCustomerSubscription", customerSubscription), [customerSubscription]);

  const commonProps = {
    users, setUsers,
    products, setProducts,
    cart, setCart,
    orders, setOrders,
    addresses, setAddresses,
    customerSubscription, setCustomerSubscription
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<Signup users={users} setUsers={setUsers} setApplications={setApplications} />} />
        <Route path="/approval-pending" element={<ApprovalPending />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard {...commonProps} /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><CartPage cart={cart} setCart={setCart} /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage cart={cart} setCart={setCart} orders={orders} setOrders={setOrders} addresses={addresses} setAddresses={setAddresses} customerSubscription={customerSubscription} /></ProtectedRoute>} />
        <Route
  path="/orders"
  element={
    <ProtectedRoute>
      <OrdersPage orders={orders} setOrders={setOrders} />
    </ProtectedRoute>
  }
/>
        <Route path="/profile" element={<ProtectedRoute><ProfilePage users={users} addresses={addresses} setAddresses={setAddresses} customerSubscription={customerSubscription} /></ProtectedRoute>} />

        <Route path="/admin" element={<AdminPanel users={users} products={products} orders={orders} applications={applications} setApplications={setApplications} customerSubscription={customerSubscription} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;