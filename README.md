# Aura Explorer API

## Prerequisite:

1. INFLUXDB

    #### Deploy on Kubernetes with Docker file:

    - Create a StatefulSet file: `influxdb.yaml` with the template below:

    ```
        apiVersion: apps/v1
        kind: StatefulSet
        metadata:
        name: influx-db
        namespace: aura
        spec:
        replicas: 1
        revisionHistoryLimit: 10
        selector:
            matchLabels:
            app: influx-db
            tier: aura
        serviceName: influx-db
        template:
            metadata:
            labels:
                app: influx-db
                tier: aura
            spec:
            containers:
                - env:
                    - name: DOCKER_INFLUXDB_INIT_MODE
                    value: setup
                    - name: DOCKER_INFLUXDB_INIT_USERNAME
                    value: aura
                    - name: DOCKER_INFLUXDB_INIT_PASSWORD
                    value: aurapassword
                    - name: DOCKER_INFLUXDB_INIT_ORG
                    value: aura-dev
                    - name: DOCKER_INFLUXDB_INIT_BUCKET
                    value: aurascan
                image: influxdb:2.1.1
                imagePullPolicy: Always
                name: influx-db
                ports:
                    - containerPort: 8086
                    protocol: TCP
                volumeMounts:
                    - mountPath: /var/lib/influxdb2
                    name: influx-db-pvc
            dnsPolicy: ClusterFirst
            restartPolicy: Always
        updateStrategy:
            rollingUpdate:
            partition: 0
            type: RollingUpdate
        volumeClaimTemplates:
            - apiVersion: v1
            kind: PersistentVolumeClaim
            metadata:
                name: influx-db-pvc
            spec:
                accessModes:
                - ReadWriteOnce
                resources:
                requests:
                    storage: 25Gi
                storageClassName: gp2
                volumeMode: Filesystem

        ---
        apiVersion: v1
        kind: Service
        metadata:
        name: influx-db
        namespace: aura
        spec:
        ports:
            - name: influx-db-port
            port: 8086
            protocol: TCP
            targetPort: 8086
        selector:
            app: influx-db
            tier: aura
        type: NodePort

    ```

    - Run the command to create influx pod & service:
    ```
        kubectl apply -f influxdb.yaml
    ```

    #### Or install with other methods on: https://docs.influxdata.com/influxdb/v2.1/install/

2. MySQL

    #### Download: https://dev.mysql.com/downloads/mysql/

3. Aura node

    #### Check the environment here: https://docs.aura.network/environment

4. NodeJS

    #### Download: https://nodejs.org/en/download/

## How to run

1. Create a `.env` in the root folder with the template below and edit with your config:
    ```
        # APP
        API_PREFIX=api/v1
        PORT=3000
        START_HEIGHT=1
        COSMOS_SCAN_API=https://cosmos-scan-api.aura.network/

        # DATABASE
        DB_HOST=localhost
        DB_PORT=3306
        DB_NAME=aurascan
        DB_USER=user
        DB_PASS=pass

        # NODE
        RPC=https://tendermint-testnet.aura.network/
        API=https://rpc-testnet.aura.network/

        # INFLUXDB
        INFLUXDB_TOKEN=token
        INFLUXDB_URL=localhost:8086
        INFLUXDB_BUCKET=aurascan
        INFLUXDB_ORG=aura-dev

    ```
2. Run   

    ### Native way
    
    Run the command: ```npm run start```

    ### Docker way

    Use `Dockerfile`
