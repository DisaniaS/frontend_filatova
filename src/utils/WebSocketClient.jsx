class WebSocketClient {
    constructor() {
        this.ws = null;
        this.baseUrl = process.env.REACT_APP_API_URL?.replace('http', 'ws') || 'ws://localhost:8000';
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectTimeout = 3000;
        this.isConnecting = false;
        this.messageHandlers = new Set();
        this.openHandlers = new Set();
        this.closeHandlers = new Set();
        this.errorHandlers = new Set();
    }

    connect(path, onMessage, onOpen, onClose, onError) {
        // Если уже есть активное подключение или идет процесс подключения, не создаем новое
        if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
            console.log('WebSocket уже подключен или идет процесс подключения');
            // Добавляем обработчики к существующему подключению
            if (onMessage) this.messageHandlers.add(onMessage);
            if (onOpen) this.openHandlers.add(onOpen);
            if (onClose) this.closeHandlers.add(onClose);
            if (onError) this.errorHandlers.add(onError);
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }

        this.isConnecting = true;
        const wsUrl = `${this.baseUrl}${path}?token=${token}`;
        
        // Очищаем старые обработчики при новом подключении
        this.messageHandlers.clear();
        this.openHandlers.clear();
        this.closeHandlers.clear();
        this.errorHandlers.clear();

        // Добавляем новые обработчики
        if (onMessage) this.messageHandlers.add(onMessage);
        if (onOpen) this.openHandlers.add(onOpen);
        if (onClose) this.closeHandlers.add(onClose);
        if (onError) this.errorHandlers.add(onError);

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.isConnecting = false;
            this.reconnectAttempts = 0;
            this.openHandlers.forEach(handler => handler());
        };

        this.ws.onmessage = (event) => {
            this.messageHandlers.forEach(handler => handler(event));
        };

        this.ws.onclose = (event) => {
            console.log('WebSocket disconnected:', event.code, event.reason);
            this.isConnecting = false;
            this.closeHandlers.forEach(handler => handler(event));

            // Попытка переподключения только если это не было намеренное закрытие
            if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
                setTimeout(() => this.connect(path), this.reconnectTimeout);
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.errorHandlers.forEach(handler => handler(error));
        };
    }

    send(message) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(message);
        } else {
            console.error('WebSocket is not connected');
        }
    }

    close() {
        if (this.ws) {
            // Удаляем все обработчики перед закрытием
            this.messageHandlers.clear();
            this.openHandlers.clear();
            this.closeHandlers.clear();
            this.errorHandlers.clear();
            
            // Закрываем соединение с кодом 1000 (нормальное закрытие)
            this.ws.close(1000, "Normal closure");
            this.ws = null;
            this.isConnecting = false;
        }
    }

    // Метод для удаления конкретного обработчика
    removeHandler(type, handler) {
        switch(type) {
            case 'message':
                this.messageHandlers.delete(handler);
                break;
            case 'open':
                this.openHandlers.delete(handler);
                break;
            case 'close':
                this.closeHandlers.delete(handler);
                break;
            case 'error':
                this.errorHandlers.delete(handler);
                break;
        }
    }
}

export default new WebSocketClient(); 