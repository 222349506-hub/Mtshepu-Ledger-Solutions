    // Point this to your actual running server address
    const API_BASE_URL = 'https://ml-server-1-sdxt.onrender.com'

    function fetchVaultRecords() {
        const adminTokenInput = document.getElementById("adminTokenInput").value.trim();
        const tbody = document.getElementById("vaultTableBody");

        if (!adminTokenInput) {
            alert("Please input an admin authentication key.");
            return;
        }

        tbody.innerHTML = `<tr><td colspan="7" class="loading-text">Querying secure ledger database pipeline...</td></tr>`;

        fetch(`${API_BASE_URL}/api/orders/retrieve-vault`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-auth': adminTokenInput
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Access Denied (${response.status}): Check your key code criteria.`);
            }
            return response.json();
        })
        .then(data => {
            if (!data.success || !data.vaultRecords) {
                throw new Error(data.message || "Failed to parse records.");
            }

            if (data.vaultRecords.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" class="loading-text">No operational ledger rows found inside vault storage file.</td></tr>`;
                return;
            }

            tbody.innerHTML = ""; // Wipe table clean
            
            data.vaultRecords.forEach(order => {
                const tr = document.createElement("tr");
                
                // Formulate columns cleanly
                tr.innerHTML = `
                    <td><strong>#${order.id}</strong></td>
                    <td>
                        <strong>${escapeHTML(order.client_name)}</strong><br>
                        <span style="color: #64748b; font-size: 12px;">${escapeHTML(order.client_email)}</span>
                    </td>
                    <td style="max-width: 300px; word-wrap: break-word;">${escapeHTML(order.selected_items || 'None Selected')}</td>
                    <td><span style="color: #475569;">${escapeHTML(order.transaction_tier || 'N/A')}</span></td>
                    <td><strong style="color: var(--accent);">${escapeHTML(order.calculated_investment)}</strong></td>
                    <td style="color: #64748b; font-size: 12px;">${new Date(order.submission_date).toLocaleString('en-ZA')}</td>
                    <td>
                        <select onchange="updateOrderStatus(${order.id}, this.value)">
                            <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>Completed</option>
                        </select>
                        <div style="margin-top: 6px;">
                            <span class="status-badge status-${order.status}">${order.status}</span>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => {
            console.error("Dashboard engine failure:", err);
            tbody.innerHTML = `<tr><td colspan="7" class="loading-text" style="color: #ef4444;">Error: ${err.message}</td></tr>`;
        });
    }

    function updateOrderStatus(orderId, newStatus) {
        const secretKey = document.getElementById("secretKeyField").value.trim();

        fetch(`${API_BASE_URL}/api/orders/update-status/${orderId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-auth': secretKey
            },
            body: JSON.stringify({ newStatus: newStatus })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Instantly re-fetch records to update badges gracefully without layout pops
                fetchVaultRecords();
            } else {
                alert("Status update failed: " + data.message);
            }
        })
        .catch(err => {
            console.error("Network interface error:", err);
            alert("Could not commit updates to database framework server.");
        });
    }

    // Safety function preventing XSS layout injections inside database text rows
    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // Automatically try to load if a default key exists in input field
    window.addEventListener('DOMContentLoaded', () => {
        if(document.getElementById("adminTokenInput").value) {
            fetchVaultRecords();
        }
    });