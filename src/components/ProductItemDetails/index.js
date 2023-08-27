import {Component} from 'react'
import {Link} from 'react-router-dom'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import {BsPlusSquare, BsDashSquare} from 'react-icons/bs'

import Header from '../Header'
import SimilarProductItem from '../SimilarProductItem'
import './index.css'

const apiStatusConstant = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'INPROGRESS',
}

class ProductItemDetails extends Component {
  state = {
    productsData: {},
    similarProductData: [],
    quantity: 1,
    apiStatus: apiStatusConstant.initial,
  }

  componentDidMount() {
    this.getProducts()
  }

  getFormattedData = data => ({
    availability: data.availability,
    id: data.id,
    brand: data.brand,
    price: data.price,
    rating: data.rating,
    title: data.title,
    totalReviews: data.total_reviews,
    description: data.description,
    imageUrl: data.image_url,
  })

  getProducts = async () => {
    const {match} = this.props
    const {params} = match
    const {id} = params

    this.setState({apiStatus: apiStatusConstant.inProgress})
    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = `https://apis.ccbp.in/products/${id}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(apiUrl, options)
    console.log(response)
    if (response.ok) {
      const fetchedData = await response.json()
      console.log(fetchedData)
      const updatedData = this.getFormattedData(fetchedData)
      const updatedSimilarData = fetchedData.similar_products.map(each =>
        this.getFormattedData(each),
      )

      console.log(updatedData)
      console.log(updatedSimilarData)
      this.setState({
        productsData: updatedData,
        similarProductData: updatedSimilarData,
        apiStatus: apiStatusConstant.success,
      })
    }
    if (response.status === 404) {
      this.setState({apiStatus: apiStatusConstant.failure})
    }
  }

  onDecrementQuantity = () => {
    const {quantity} = this.state
    console.log(quantity)
    if (quantity > 1) {
      this.setState(prev => ({quantity: prev.quantity - 1}))
    }
  }

  onIncrementQuantity = () => {
    const {quantity} = this.state
    console.log(quantity)
    if (quantity <= 1) {
      this.setState(prev => ({quantity: prev.quantity + 1}))
    }
  }

  renderLoadingView = () => (
    <div className="products-loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#0b69ff" height="50" width="50" />
    </div>
  )

  renderFailureView = () => (
    <div>
      <img
        src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-error-view-img.png"
        alt="failure view"
      />
      <h1>Product Not Found</h1>
      <Link to="/products">
        <button type="button">Continue Shopping</button>
      </Link>
    </div>
  )

  renderSuccessView = () => {
    const {productsData, quantity, similarProductData} = this.state
    const {
      availability,
      brand,
      description,
      imageUrl,
      price,
      rating,
      title,
      totalReviews,
    } = productsData

    return (
      <div className="success-container">
        <div className="container">
          <img src={imageUrl} alt="product" className="product-img" />
          <div className="products">
            <h1 className="titled">{title}</h1>
            <p className="priced">Rs {price}/</p>
            <div className="rating-review">
              <div className="rating-container">
                <p className="rating">{rating}</p>
                <img
                  src="https://assets.ccbp.in/frontend/react-js/star-img.png"
                  alt="star"
                  className="star"
                />
              </div>
              <p className="review-count">{totalReviews} Reviews</p>
            </div>
            <p className="product-description">{description}</p>
            <div className="label-value-container">
              <p className="para">Available:</p>
              <p className="value">{availability}</p>
            </div>
            <div className="label-value-container">
              <p className="para">Brand:</p>
              <p className="value">{brand}</p>
            </div>
            <hr className="h-line" />

            <div className="quality-container">
              <button
                type="button"
                className="button"
                onClick={this.onDecrementQuantity}
                data-testid="minus"
              >
                <BsDashSquare />
              </button>
              <p className="quantity">{quantity}</p>
              <button
                type="button"
                className="button"
                onClick={this.onIncrementQuantity}
                data-testid="plus"
              >
                <BsPlusSquare />
              </button>
            </div>
            <button type="button" className="cart">
              Add to Cart
            </button>
          </div>
        </div>
        <h1 className="heading">Similar Products</h1>
        <ul className="similar-container">
          {similarProductData.map(eachSimilar => (
            <SimilarProductItem
              productDetails={eachSimilar}
              key={eachSimilar.id}
            />
          ))}
        </ul>
      </div>
    )
  }

  renderAllProducts = () => {
    const {apiStatus} = this.state

    switch (apiStatus) {
      case apiStatusConstant.success:
        return this.renderSuccessView()
      case apiStatusConstant.failure:
        return this.renderFailureView()
      case apiStatusConstant.inProgress:
        return this.renderLoadingView()
      default:
        return null
    }
  }

  render() {
    return (
      <>
        <Header />
        <div className="product-detail-item-container">
          {this.renderAllProducts()}
        </div>
      </>
    )
  }
}

export default ProductItemDetails
