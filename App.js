import { StatusBar } from 'expo-status-bar';
import React, { useEffect,useState } from 'react';
import { StyleSheet, DrawerLayoutAndroid, Button, Text, TextInput, View, FlatList, Alert } from 'react-native';
import { NativeRouter, Route, Link, Switch, Redirect, useHistory, useRouteMatch } from 'react-router-native';

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#82f5de',
    padding: 30,
    //marginVertical: 8,
    //marginHorizontal: 16,
  },
  detalle: {
    flex: 2,
    backgroundColor: '#14b383',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    alignSelf: 'stretch',
  },
  title: {
    fontSize: 32,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    padding: 10,
    
  },
  button_b: {
    backgroundColor: '#14b383',
  }
});

const ItemSeparator = () => <View style={styles.separator} >
</View>;

const TestCompButtons = () => {
  const _onPressButton = () => {
    alert("pressed")
  }

  
  return(
    <View>
      <Button
        style={styles.button_b}
        onPress={_onPressButton}
        title="Press"
      > 
      </Button>
    </View>
  )
}

const Detalles = (props) => {
  const renderDetalle = (props) => {
    //console.log("DETALLES", props)

    return(<View style={styles.detalle}>
    <Text>Producto: {props.item.Producto.descripcion}</Text>
    <Text>Cantidad: {props.item.cantidad}</Text>
    </View>)
  }

  return (
    <FlatList
        data={props.DetallePedidos}
        renderItem={renderDetalle}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={ItemSeparator}
        // other props
      />
  )
}
const PedidosList = (props) => {

  const [_pedidos, setPedidos] = useState([]);
  const [pedidosFiltered, setPedidosFiltered] = useState([]);
  const [busqueda, setBusqueda] = useState("Buscar...");
  const [loading, setLoading]  = useState(true);
  const fetchPedidos = async () => {
     //  192.168.1.12
     const response = await fetch('http://192.168.1.12:3001/pedidos/cliente');
     const json = await response.json();
 
     //console.log("peido", json.data)
     setPedidos(json.data)
     setPedidosFiltered(json.data)
     setLoading(false)
  } 
  
  useEffect(() => {
    fetchPedidos();
   }, []);

   let history = useHistory()
   const goBack = () => {
       history.push({
         pathname: `/`
     });
 
   }

  const renderPedido = (props) =>{
    const marcarPedidoEntregadoPagadp = (pId, pagado_entregado) => {
        let url = ""
        if(pagado_entregado === "pagado"){
          url = "http://192.168.1.12:3001/pedidos/cliente/pagado"
        }
        else if(pagado_entregado === "entregado"){
          url = "http://192.168.1.12:3001/pedidos/cliente/entregado"
        } else {
          return;
        }

        const payload = {
            id: pId,
        }

        console.log(payload)
        console.log("JSON", JSON.stringify(payload))

        const marcar = () => {
            console.log(payload)
            fetch(url, {
              method: 'PUT',
              headers: {
                'Accept': 'application/json, text/plain, */*', 
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
            }).then(response => response.json()).catch(e => console.log(e))
            
        }

        Alert.alert(
          "Confirmacion",
          `¿Desea marcar pedido como ${pagado_entregado}?`,
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
            },
            { text: "OK", onPress: () => {
              marcar()
            } }
          ],
          { cancelable: false }
        );

       
      }

      //const marcarPedidoPagado = (pId) => {
      //    const payload = {
      //        id: pId,
      //    }
      //    console.log(payload)
      //    api.put("/pedidos/cliente/pagado", payload).then(r => {
      //        console.log(r.data)
      //        alert("Pagado")
      //        //setfUpdate(!fUpdate)
      //        window.location.reload()
      //    }).catch(e => console.log(e))
      //}

    //console.log("renderPedido", props)
    return(<View style={styles.item}>
      
      <Text>Pedido de {props.item.Cliente.nombre}</Text>
      <Text>TOTAL: ${props.item.Pedido.total}</Text>
      <Detalles DetallePedidos={props.item.Pedido.DetallePedidos}/>
        <Button
          color="#14b383"
          onPress={() => {marcarPedidoEntregadoPagadp(props.item.id, "pagado")}}
          title="Marcar Pagado"
          disabled={props.item.pagado}
        ></Button>
        
        <Button
          color="#14b383"
          onPress={() => {marcarPedidoEntregadoPagadp(props.item.id, "entregado")}}
          title="Marcar Entregado"
          disabled={props.item.entregado}
        ></Button>
    </View>)
  }

  if(!loading){

      return (
        <View style={{flex:1}}>
          <View style={{flex:1}}>
          <TextInput
            style={{ height: 30, borderColor: 'gray', borderWidth: 1 }}
            onChangeText={text => 
              {

                setBusqueda(text)
               

              }}
            value={busqueda}
          />
          <Button
            color="#14b383"
            onPress={() => {
                const filt = (pedido) => {
                  return pedido.Cliente.nombre.includes(busqueda);
                }
                setPedidosFiltered(_pedidos.filter(filt))

            }}
            title="Buscar"
          ></Button>
          </View>
          
          <View style={{flex:5}}>
          
          
          
        <FlatList
          data={pedidosFiltered}
          renderItem={renderPedido}
          ItemSeparatorComponent={ItemSeparator}
          keyExtractor={item => item.id}
        />
        </View>
        </View>
      )
  } else {
    return (
      <View >
        <Text>Cargando...</Text>
        </View>
    )
  }

}

const ProductoConsulta = () => {
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("Buscar...");
  const [loading, setLoading]  = useState(true);
  
  const onBusquedaChange = (text) => {
    setBusqueda(text)
  }

  let history = useHistory()
  const goBack = () => {
      history.push({
        pathname: `/`
    });

  }
  const fetchProductos = async () => {
     //  192.168.1.12
     const response = await fetch('http://192.168.1.12:3001/productos');
     const json = await response.json();
 
     //console.log("producto", json.data)
     setProductos(json.data)
     setLoading(false)
  } 
  
  useEffect(() => {
    fetchProductos();
   }, []);

   const renderProducto = (props) =>{
    
    return(<View style={styles.item}>
      <Text>Producto {props.item.descripcion}</Text>
      <Text>Precio: ${props.item.precio}</Text>
      <Text>Stock: {props.item.stock}</Text>
      
    </View>)
  }

  if(!loading){

    return (
      <View style={{flex:1}}>
          <View style={{flex:1}}>
         <TextInput
            style={{ height: 30, borderColor: 'gray', borderWidth: 1 }}
            onChangeText={text => {
              
              setBusqueda(text)
            }}
            value={busqueda}
          />

          <Button
            color="#14b383"
            onPress={() => {
                const filt = (producto) => {
                  return producto.descripcion.includes(busqueda);
                }
                setFilteredProductos(productos.filter(filt))

            }}
            title="Buscar"
          ></Button>
          

        </View>

        <View style={{flex:5}}>
          <FlatList
            data={filteredProductos}
            renderItem={renderProducto}
            ItemSeparatorComponent={ItemSeparator}
            keyExtractor={item => item.id}
          />
        </View>
      </View>
    )
    
  }else{
    return (
      <View>
      <Text>Cargando...</Text>
      </View>
    )
    
  }
}

const Menu = () =>{
  let history = useHistory()
  let match = useRouteMatch();
  
  const goToPedidosClick = () => {
     console.log(`${match.path}/pedidos`)
      history.push({
          pathname: `${match.path}pedidos`
      });
  }

  const goToProductosClick = () => {
     history.push({
         pathname: `${match.path}productos`
     });
 }
  return (
    
    <View style={{flex: 1}}>
      <Text style={{flex: 1}}>
        TITULO
      </Text>
      <View style={{flex: 5}}> 
        <Button
          onPress={goToPedidosClick}
          title="Pedidos"
          style={{flex: 1}}
        > 
        </Button>
        <Button
          onPress={goToProductosClick}
          title="Productos"
        > 
        </Button>
      </View>
    </View>
  )
}

const Main = (props) => {
  let history = useHistory()
  let match = useRouteMatch();
  
  const goToPedidosClick = () => {
      console.log(`${match.path}/pedidos`)
      history.push({
          pathname: `${match.path}pedidos`
      });

      closeDrawer();
  }

  const goToProductosClick = () => {
      history.push({
          pathname: `${match.path}productos`
      });

      closeDrawer();

  }

  const drawerLayoutRef = React.useRef(null);
  const closeDrawer = () => {
    if(drawerLayoutRef !== null){
      drawerLayoutRef.current.closeDrawer();
    }
  }

  const navigationView = (
    <View style={styles.navigationContainer}>
      <Text style={{ margin: 10, fontSize: 15 }}>App</Text>
      <Button  color="#14b383" onPress={goToPedidosClick} title="Pedidos"></Button>
      <Button  color="#14b383" onPress={() => {
        goToProductosClick()
        //this.props.closeDrawer();
        //console.log(navigationView)
        
      }} title="Productos"></Button>
    </View>
  );
  
  return (
    
    <DrawerLayoutAndroid
    drawerWidth={300}
    drawerPosition={"left"}
    ref={drawerLayoutRef}
    renderNavigationView={(props) => {
      
      return navigationView
    }}
  >
  
    <View style={styles.container}>
      <StatusBar hidden />  
      

      {/*<StatusBar style="auto" />*/}

      {/*<Link to="/">
        <Text>Home</Text>
      </Link>
      <Link to="/productos">
        <Text>productos</Text>
      </Link>
      <Link to="/pedidos">
        <Text>Pedidos</Text>
      </Link>*/}
      
    

      <Route exact path="/" >          
        <PedidosList />
      </Route>   

      <Route exact path="/pedidos" >          
        <PedidosList />       
      </Route>   
      <Route path="/productos" exact>
          <ProductoConsulta />   
      </Route> 
      
    </View>
    </DrawerLayoutAndroid>
  );
}

export default function App() {
  return (
  
    <NativeRouter>
       <Main />
    </NativeRouter>  
    );
};