import { useState, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import {
  searchOutline,
  refreshOutline,
  notificationsOutline,
  addOutline,
  waterOutline,
  trashOutline
} from 'ionicons/icons';
import { api } from '../services/api';
import '../AdminStyles.css';

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [receiveStockProduct, setReceiveStockProduct] = useState<any>(null);
  const [deleteProduct, setDeleteProduct] = useState<any>(null);

  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    category: '20L Container',
    price_centavos: 0,
    stock_quantity: 0
  });

  const [editPrices, setEditPrices] = useState({
    refill: 0,
    swap: 0,
    newContainer: 0
  });

  const [receiveQty, setReceiveQty] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // NOTIFICATIONS
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [pendingTopups, setPendingTopups] = useState<any[]>([]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/products');
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const [ordersRes, topupsRes] = await Promise.all([
        api.get('/admin/orders'),
        api.get('/admin/topup-requests')
      ]);

      const orders = Array.isArray(ordersRes.data)
        ? ordersRes.data
        : [];

      const topups = Array.isArray(topupsRes.data)
        ? topupsRes.data
        : [];

      setPendingOrders(
        orders.filter((o: any) =>
          ['pending', 'confirmed'].includes(o.status)
        )
      );

      setPendingTopups(
        topups.filter((t: any) => t.status === 'pending')
      );
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchNotifications();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.product_name || formData.price_centavos <= 0) {
      alert('Please fill in product name and a valid price.');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        product_name: formData.product_name.trim(),
        description: formData.description.trim() || 'Purified drinking water',
        category: formData.category || '20L Container',
        container_type: formData.category === '20L Container' ? 'Slim' : null,
        price_centavos: Math.round(formData.price_centavos * 100),
        stock_quantity: formData.stock_quantity || 0,
        is_available: true,
        refill_price_centavos:
          formData.category === 'Bottled'
            ? null
            : Math.round(formData.price_centavos * 100),
        swap_price_centavos:
          formData.category === 'Bottled'
            ? null
            : Math.round(formData.price_centavos * 100) + 1000
      };

      await api.post('/admin/products', payload);

      setShowAddModal(false);

      setFormData({
        product_name: '',
        description: '',
        category: '20L Container',
        price_centavos: 0,
        stock_quantity: 0
      });

      fetchProducts();
      alert('Product added successfully!');
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail;

      if (Array.isArray(errorMsg)) {
        alert(
          'Validation error: ' +
          errorMsg.map((e: any) => `${e.loc.join('.')}: ${e.msg}`).join(', ')
        );
      } else {
        alert(errorMsg || 'Failed to add product');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPrices = async () => {
    if (!editProduct) return;

    try {
      setSubmitting(true);

      await api.patch(`/admin/products/${editProduct.id}`, {
        refill_price_centavos:
          editPrices.refill > 0
            ? Math.round(editPrices.refill * 100)
            : null,
        swap_price_centavos:
          editPrices.swap > 0
            ? Math.round(editPrices.swap * 100)
            : null,
        price_centavos: Math.round(editPrices.newContainer * 100)
      });

      setEditProduct(null);
      fetchProducts();
      alert('Prices updated successfully!');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update prices');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReceiveStock = async () => {
    if (!receiveStockProduct) return;

    try {
      setSubmitting(true);

      await api.patch(`/admin/products/${receiveStockProduct.id}`, {
        stock_quantity: receiveStockProduct.stock_quantity + receiveQty
      });

      setReceiveStockProduct(null);
      setReceiveQty(0);
      fetchProducts();
      alert(`Added ${receiveQty} to stock!`);
    } catch (err) {
      alert('Failed to receive stock');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteProduct || !deleteProduct.id) {
      alert('Error: Product ID not found');
      return;
    }

    try {
      setSubmitting(true);

      const res = await api.delete(`/admin/products/${deleteProduct.id}`);

      alert(res.data.message || 'Product deleted successfully');
      setDeleteProduct(null);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleHide = async (product: any) => {
    try {
      await api.patch(`/admin/products/${product.id}`, {
        is_available: !product.is_available
      });

      fetchProducts();
    } catch (err) {
      alert('Failed to update product');
    }
  };

  const font = "'Plus Jakarta Sans', sans-serif";
  const display = "'Baloo 2', sans-serif";
  const ink = '#0B1F44';
  const ink2 = '#566A8A';
  const line = '#D8E5E3';
  const pri = '#2B5DB8';
  const priSoft = '#E6EEFA';
  const ok = '#12A06B';
  const okSoft = '#DDF5EA';
  const warn = '#C77700';
  const warnSoft = '#FFF1D6';
  const bad = '#D6384A';

  const lowStockProducts = products.filter(
    p => p.stock_quantity <= 12
  );

  const notificationCount =
    lowStockProducts.length +
    pendingOrders.length +
    pendingTopups.length;

  if (loading) {
    return (
      <div style={{
        padding: '50px',
        textAlign: 'center',
        color: ink
      }}>
        Loading...
      </div>
    );
  }

  const filteredProducts = products.filter(p =>
    p.product_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      fontFamily: font,
      fontSize: '13px',
      color: ink
    }}>

      {/* HEADER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'nowrap',
        gap: '16px'
      }}>
        <div style={{
          flexShrink: 1,
          minWidth: '200px'
        }}>
          <h1 style={{
            margin: '0 0 4px 0',
            fontSize: '23px',
            fontWeight: 800,
            color: ink,
            fontFamily: display
          }}>
            Products and stock
          </h1>

          <p style={{
            margin: 0,
            color: ink2,
            fontSize: '12.5px'
          }}>
            Prices and refill supplies · {
              new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            }
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          flexShrink: 0
        }}>

          {/* SEARCH */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'white',
            border: `1px solid ${line}`,
            borderRadius: '10px',
            padding: '0 12px',
            height: '38px',
            width: '230px'
          }}>
            <IonIcon
              icon={searchOutline}
              style={{
                color: ink2,
                fontSize: '17px'
              }}
            />

            <input
              type="text"
              placeholder="Search product"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                flex: 1,
                fontSize: '12.5px',
                color: ink,
                fontFamily: font
              }}
            />
          </div>

          {/* REFRESH */}
          <button
            onClick={fetchProducts}
            className="admin-hover-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0 14px',
              height: '38px',
              borderRadius: '10px',
              border: 'none',
              background: priSoft,
              cursor: 'pointer',
              fontWeight: 700,
              color: pri,
              fontSize: '12.5px'
            }}
          >
            <IonIcon icon={refreshOutline} />
            Refresh
          </button>

          {/* NOTIFICATION BELL */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                fetchNotifications();
              }}
              className="admin-hover-btn"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                border: `1px solid ${line}`,
                background: 'white',
                display: 'grid',
                placeItems: 'center',
                position: 'relative',
                cursor: 'pointer'
              }}
            >
              <IonIcon
                icon={notificationsOutline}
                style={{
                  fontSize: '19px',
                  color: ink2
                }}
              />

              {notificationCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: bad,
                  color: 'white',
                  borderRadius: '999px',
                  fontSize: '9px',
                  fontWeight: 800,
                  minWidth: '16px',
                  height: '16px',
                  display: 'grid',
                  placeItems: 'center',
                  padding: '0 3px'
                }}>
                  {notificationCount}
                </span>
              )}
            </button>

            {/* NOTIFICATION DROPDOWN */}
            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: '48px',
                right: 0,
                width: '310px',
                background: 'white',
                border: `1px solid ${line}`,
                borderRadius: '14px',
                boxShadow: '0 10px 30px rgba(11,31,68,0.15)',
                zIndex: 200,
                overflow: 'hidden'
              }}>

                {/* DROPDOWN HEADER */}
                <div style={{
                  padding: '15px 16px',
                  borderBottom: `1px solid ${line}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <strong style={{
                    fontSize: '14px',
                    color: ink
                  }}>
                    Notifications
                  </strong>

                  <button
                    onClick={() => setShowNotifications(false)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: ink2,
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Close
                  </button>
                </div>

                {/* NOTIFICATION LIST */}
                <div style={{
                  maxHeight: '320px',
                  overflowY: 'auto'
                }}>

                  {notificationCount === 0 ? (
                    <div style={{
                      padding: '25px 15px',
                      textAlign: 'center',
                      color: ink2,
                      fontSize: '12px'
                    }}>
                      You're all caught up!
                    </div>
                  ) : (
                    <>

                      {/* LOW STOCK */}
                      {lowStockProducts.map(p => (
                        <div
                          key={`stock-${p.id}`}
                          style={{
                            padding: '13px 16px',
                            borderBottom: `1px solid ${line}`,
                            display: 'flex',
                            gap: '11px',
                            alignItems: 'flex-start'
                          }}
                        >
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '9px',
                            background: warnSoft,
                            color: warn,
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0
                          }}>
                            <IonIcon icon={waterOutline} />
                          </div>

                          <div>
                            <div style={{
                              fontWeight: 700,
                              color: ink,
                              fontSize: '12px'
                            }}>
                              Low stock
                            </div>

                            <div style={{
                              color: ink2,
                              fontSize: '11px',
                              marginTop: '3px'
                            }}>
                              {p.product_name} has only {p.stock_quantity} left.
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* PENDING ORDERS */}
                      {pendingOrders.length > 0 && (
                        <div style={{
                          padding: '13px 16px',
                          borderBottom: `1px solid ${line}`,
                          display: 'flex',
                          gap: '11px',
                          alignItems: 'flex-start'
                        }}>
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '9px',
                            background: priSoft,
                            color: pri,
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0
                          }}>
                            <IonIcon icon={refreshOutline} />
                          </div>

                          <div>
                            <div style={{
                              fontWeight: 700,
                              color: ink,
                              fontSize: '12px'
                            }}>
                              Pending Orders
                            </div>

                            <div style={{
                              color: ink2,
                              fontSize: '11px',
                              marginTop: '3px'
                            }}>
                              {pendingOrders.length} order(s) need attention.
                            </div>
                          </div>
                        </div>
                      )}

                      {/* PENDING TOP-UPS */}
                      {pendingTopups.length > 0 && (
                        <div style={{
                          padding: '13px 16px',
                          borderBottom: `1px solid ${line}`,
                          display: 'flex',
                          gap: '11px',
                          alignItems: 'flex-start'
                        }}>
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '9px',
                            background: okSoft,
                            color: ok,
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0
                          }}>
                            <IonIcon icon={addOutline} />
                          </div>

                          <div>
                            <div style={{
                              fontWeight: 700,
                              color: ink,
                              fontSize: '12px'
                            }}>
                              Pending Top-ups
                            </div>

                            <div style={{
                              color: ink2,
                              fontSize: '11px',
                              marginTop: '3px'
                            }}>
                              {pendingTopups.length} top-up request(s) need review.
                            </div>
                          </div>
                        </div>
                      )}

                    </>
                  )}
                </div>

                {/* REFRESH NOTIFICATIONS */}
                <button
                  onClick={() => {
                    fetchNotifications();
                    fetchProducts();
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: 'none',
                    borderTop: `1px solid ${line}`,
                    background: '#F8FAFC',
                    color: pri,
                    fontWeight: 700,
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  <IonIcon
                    icon={refreshOutline}
                    style={{ marginRight: '5px' }}
                  />
                  Refresh notifications
                </button>
              </div>
            )}
          </div>

          {/* ADMIN PROFILE */}
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: priSoft,
            color: pri,
            display: 'grid',
            placeItems: 'center',
            fontWeight: 800,
            fontSize: '12px'
          }}>
            SA
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <p style={{
          margin: 0,
          color: ink2,
          fontSize: '12px'
        }}>
          Container types you sell. Hidden ones disappear from the customer app.
        </p>

        <button
          onClick={() => setShowAddModal(true)}
          className="admin-hover-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0 16px',
            height: '38px',
            borderRadius: '10px',
            border: 'none',
            background: pri,
            cursor: 'pointer',
            fontWeight: 700,
            color: 'white',
            fontSize: '12.5px'
          }}
        >
          <IonIcon icon={addOutline} />
          Add container type
        </button>
      </div>

      {/* TABLE */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        border: `1px solid ${line}`,
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(11,31,68,.05)',
        padding: '0 18px'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left'
        }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${line}` }}>
              <th style={{
                padding: '13px 8px',
                fontSize: '10.5px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: ink2
              }}>
                PRODUCT
              </th>

              <th style={{
                padding: '13px 8px',
                fontSize: '10.5px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: ink2
              }}>
                REFILL
              </th>

              <th style={{
                padding: '13px 8px',
                fontSize: '10.5px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: ink2
              }}>
                SWAP
              </th>

              <th style={{
                padding: '13px 8px',
                fontSize: '10.5px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: ink2
              }}>
                NEW
              </th>

              <th style={{
                padding: '13px 8px',
                fontSize: '10.5px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: ink2
              }}>
                STOCK
              </th>

              <th style={{
                padding: '13px 8px',
                fontSize: '10.5px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: ink2
              }}>
                STATUS
              </th>

              <th style={{
                padding: '13px 8px',
                minWidth: '340px'
              }}></th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: '30px',
                    textAlign: 'center',
                    color: ink2
                  }}
                >
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const isLow = p.stock_quantity <= 12;

                return (
                  <tr
                    key={p.id}
                    className="admin-table-row"
                    style={{ borderBottom: `1px solid ${line}` }}
                  >
                    <td style={{
                      padding: '14px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '9px',
                        background: priSoft,
                        color: pri,
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0
                      }}>
                        <IonIcon
                          icon={waterOutline}
                          style={{ fontSize: '19px' }}
                        />
                      </div>

                      <div>
                        <div style={{
                          fontWeight: 700,
                          fontSize: '14.5px',
                          color: ink
                        }}>
                          {p.product_name}
                        </div>

                        <div style={{
                          fontSize: '12px',
                          color: ink2,
                          marginTop: '1px'
                        }}>
                          {p.description || 'Purified water'}
                        </div>
                      </div>
                    </td>

                    <td style={{
                      padding: '14px 8px',
                      fontSize: '13.5px',
                      color: ink,
                      fontWeight: 600
                    }}>
                      {p.refill_price_centavos
                        ? `₱${(p.refill_price_centavos / 100).toFixed(2)}`
                        : '—'}
                    </td>

                    <td style={{
                      padding: '14px 8px',
                      fontSize: '13.5px',
                      color: ink,
                      fontWeight: 600
                    }}>
                      {p.swap_price_centavos
                        ? `₱${(p.swap_price_centavos / 100).toFixed(2)}`
                        : '—'}
                    </td>

                    <td style={{
                      padding: '14px 8px',
                      fontSize: '13.5px',
                      color: ink,
                      fontWeight: 700
                    }}>
                      ₱{(p.price_centavos / 100).toFixed(2)}
                    </td>

                    <td style={{ padding: '14px 8px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '7px'
                      }}>
                        <span style={{
                          fontWeight: 700,
                          color: isLow ? warn : ink,
                          fontSize: '14px'
                        }}>
                          {p.stock_quantity}
                        </span>

                        <span style={{
                          fontSize: '11px',
                          color: ink2
                        }}>
                          reorder at 12
                        </span>
                      </div>

                      <div style={{
                        height: '5px',
                        background: line,
                        borderRadius: '3px',
                        marginTop: '4px',
                        overflow: 'hidden',
                        width: '90px'
                      }}>
                        <div style={{
                          height: '100%',
                          background: isLow ? warn : pri,
                          width: `${Math.min((p.stock_quantity / 50) * 100, 100)}%`
                        }} />
                      </div>
                    </td>

                    <td style={{ padding: '14px 8px' }}>
                      <span style={{
                        background: !p.is_available
                          ? line
                          : isLow
                            ? warnSoft
                            : okSoft,
                        color: !p.is_available
                          ? ink2
                          : isLow
                            ? warn
                            : ok,
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        {!p.is_available
                          ? 'Hidden'
                          : isLow
                            ? 'Low stock'
                            : 'In stock'}
                      </span>
                    </td>

                    <td style={{
                      padding: '14px 8px',
                      textAlign: 'right'
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '6px',
                        justifyContent: 'flex-end'
                      }}>
                        <button
                          onClick={() => setReceiveStockProduct(p)}
                          className="admin-hover-btn"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '9px 14px',
                            borderRadius: '8px',
                            border: 'none',
                            background: priSoft,
                            color: pri,
                            fontWeight: 700,
                            fontSize: '12.5px',
                            cursor: 'pointer'
                          }}
                        >
                          <IonIcon
                            icon={addOutline}
                            style={{ fontSize: '15px' }}
                          />
                          Receive stock
                        </button>

                        <button
                          onClick={() => {
                            setEditProduct(p);
                            setEditPrices({
                              refill: (p.refill_price_centavos || 0) / 100,
                              swap: (p.swap_price_centavos || 0) / 100,
                              newContainer: p.price_centavos / 100
                            });
                          }}
                          className="admin-hover-btn"
                          style={{
                            padding: '9px 14px',
                            borderRadius: '8px',
                            border: `1px solid ${line}`,
                            background: 'white',
                            color: ink,
                            fontWeight: 700,
                            fontSize: '12.5px',
                            cursor: 'pointer'
                          }}
                        >
                          Edit prices
                        </button>

                        <button
                          onClick={() => handleToggleHide(p)}
                          className="admin-hover-btn"
                          style={{
                            padding: '9px 14px',
                            borderRadius: '8px',
                            border: `1px solid ${line}`,
                            background: 'white',
                            color: ink2,
                            fontWeight: 700,
                            fontSize: '12.5px',
                            cursor: 'pointer'
                          }}
                        >
                          {p.is_available ? 'Hide' : 'Show'}
                        </button>

                        <button
                          onClick={() => setDeleteProduct(p)}
                          className="admin-hover-btn"
                          style={{
                            padding: '9px 11px',
                            borderRadius: '8px',
                            border: `1px solid ${bad}`,
                            background: '#FEF2F2',
                            color: bad,
                            fontWeight: 700,
                            fontSize: '12.5px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <IonIcon
                            icon={trashOutline}
                            style={{ fontSize: '17px' }}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p style={{
        margin: 0,
        fontSize: '11.5px',
        color: ink2
      }}>
        Refill and swap orders use the customer's own container, so only new containers and bottled cases reduce stock when an order is placed. Cancelled orders put new containers back.
      </p>

      {/* MODALS */}

      {/* 1. ADD MODAL */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(11,31,68,0.5)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 100
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            width: 'min(500px, 90%)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '22px',
              fontWeight: 800,
              color: ink,
              fontFamily: display
            }}>
              Add container type
            </h2>

            <form
              onSubmit={handleAddProduct}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: ink2,
                  marginBottom: '6px'
                }}>
                  Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. 5-Gallon Round"
                  required
                  value={formData.product_name}
                  onChange={e => setFormData({
                    ...formData,
                    product_name: e.target.value
                  })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: `1px solid ${line}`,
                    fontSize: '14px',
                    fontFamily: font
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: ink2,
                  marginBottom: '6px'
                }}>
                  Short description (optional)
                </label>

                <input
                  type="text"
                  placeholder="e.g. Classic round container"
                  value={formData.description}
                  onChange={e => setFormData({
                    ...formData,
                    description: e.target.value
                  })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: `1px solid ${line}`,
                    fontSize: '14px',
                    fontFamily: font
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: ink2,
                  marginBottom: '6px'
                }}>
                  Category
                </label>

                <select
                  value={formData.category}
                  onChange={e => setFormData({
                    ...formData,
                    category: e.target.value
                  })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: `1px solid ${line}`,
                    fontSize: '14px',
                    fontFamily: font,
                    background: 'white'
                  }}
                >
                  <option value="20L Container">20L Container</option>
                  <option value="Bottled">Bottled (sealed)</option>
                  <option value="Packaged">Packaged</option>
                </select>
              </div>

              <div style={{
                display: 'flex',
                gap: '16px'
              }}>
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: ink2,
                    marginBottom: '6px'
                  }}>
                    New container price (₱)
                  </label>

                  <input
                    type="number"
                    required
                    value={formData.price_centavos || ''}
                    onChange={e => setFormData({
                      ...formData,
                      price_centavos: Number(e.target.value)
                    })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: `1px solid ${line}`,
                      fontSize: '14px',
                      fontFamily: font
                    }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: ink2,
                    marginBottom: '6px'
                  }}>
                    Stock on hand
                  </label>

                  <input
                    type="number"
                    required
                    value={formData.stock_quantity || ''}
                    onChange={e => setFormData({
                      ...formData,
                      stock_quantity: Number(e.target.value)
                    })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: `1px solid ${line}`,
                      fontSize: '14px',
                      fontFamily: font
                    }}
                  />
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '10px'
              }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="admin-hover-btn"
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: `1.5px solid ${line}`,
                    background: 'white',
                    color: ink,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: font,
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="admin-hover-btn"
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: pri,
                    color: 'white',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: font,
                    fontSize: '14px',
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting ? 'Adding...' : 'Add container'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT PRICES MODAL */}
      {editProduct && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(11,31,68,0.5)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 100
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            width: 'min(500px, 90%)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '22px',
              fontWeight: 800,
              color: ink,
              fontFamily: display
            }}>
              Edit prices · {editProduct.product_name}
            </h2>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{
                display: 'flex',
                gap: '16px'
              }}>
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: ink2,
                    marginBottom: '6px'
                  }}>
                    Refill price (₱)
                  </label>

                  <input
                    type="number"
                    value={editPrices.refill || ''}
                    onChange={e => setEditPrices({
                      ...editPrices,
                      refill: Number(e.target.value)
                    })}
                    placeholder="blank = none"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: `1px solid ${line}`,
                      fontSize: '14px',
                      fontFamily: font
                    }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: ink2,
                    marginBottom: '6px'
                  }}>
                    Swap price (₱)
                  </label>

                  <input
                    type="number"
                    value={editPrices.swap || ''}
                    onChange={e => setEditPrices({
                      ...editPrices,
                      swap: Number(e.target.value)
                    })}
                    placeholder="blank = none"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: `1px solid ${line}`,
                      fontSize: '14px',
                      fontFamily: font
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: ink2,
                  marginBottom: '6px'
                }}>
                  New container / case (₱)
                </label>

                <input
                  type="number"
                  value={editPrices.newContainer}
                  onChange={e => setEditPrices({
                    ...editPrices,
                    newContainer: Number(e.target.value)
                  })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: `1px solid ${line}`,
                    fontSize: '14px',
                    fontFamily: font
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '10px'
              }}>
                <button
                  onClick={() => setEditProduct(null)}
                  className="admin-hover-btn"
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: `1.5px solid ${line}`,
                    background: 'white',
                    color: ink,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: font,
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={handleEditPrices}
                  disabled={submitting}
                  className="admin-hover-btn"
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: pri,
                    color: 'white',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: font,
                    fontSize: '14px',
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting ? 'Saving...' : 'Save prices'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. RECEIVE STOCK MODAL */}
      {receiveStockProduct && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(11,31,68,0.5)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 100
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            width: 'min(500px, 90%)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '22px',
              fontWeight: 800,
              color: ink,
              fontFamily: display
            }}>
              Receive stock
            </h2>

            <div style={{
              background: '#F4F9F8',
              padding: '16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: priSoft,
                color: pri,
                display: 'grid',
                placeItems: 'center'
              }}>
                <IonIcon
                  icon={waterOutline}
                  style={{ fontSize: '20px' }}
                />
              </div>

              <div>
                <div style={{
                  fontWeight: 700,
                  color: ink,
                  fontSize: '14px'
                }}>
                  {receiveStockProduct.product_name}
                </div>

                <div style={{
                  fontSize: '12px',
                  color: ink2
                }}>
                  {receiveStockProduct.stock_quantity} in stock now
                </div>
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 700,
                color: ink2,
                marginBottom: '6px'
              }}>
                Quantity received
              </label>

              <input
                type="number"
                placeholder="e.g. 24"
                value={receiveQty || ''}
                onChange={e => setReceiveQty(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: `1px solid ${line}`,
                  fontSize: '14px',
                  fontFamily: font
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => {
                  setReceiveStockProduct(null);
                  setReceiveQty(0);
                }}
                className="admin-hover-btn"
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: `1.5px solid ${line}`,
                  background: 'white',
                  color: ink,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: font,
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleReceiveStock}
                disabled={submitting}
                className="admin-hover-btn"
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: pri,
                  color: 'white',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: font,
                  fontSize: '14px',
                  opacity: submitting ? 0.7 : 1
                }}
              >
                {submitting ? 'Adding...' : 'Add to stock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. DELETE MODAL */}
      {deleteProduct && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(11,31,68,0.5)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 100
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            width: 'min(500px, 90%)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '22px',
              fontWeight: 800,
              color: bad,
              fontFamily: display
            }}>
              Delete product
            </h2>

            <p style={{
              margin: 0,
              color: ink,
              fontSize: '14px'
            }}>
              Are you sure you want to delete{' '}
              <strong>{deleteProduct.product_name}</strong>?
              This action cannot be undone.
            </p>

            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => setDeleteProduct(null)}
                className="admin-hover-btn"
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: `1.5px solid ${line}`,
                  background: 'white',
                  color: ink,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: font,
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={submitting}
                className="admin-hover-btn"
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: bad,
                  color: 'white',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: font,
                  fontSize: '14px',
                  opacity: submitting ? 0.7 : 1
                }}
              >
                {submitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProductsPage;